"use client";

import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { TeacherIdentity, type TeacherInfo } from "@/components/teacher/TeacherIdentity";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { MockCaption } from "@/components/ui/MockCaption";
import { Tabs } from "@/components/ui/Tabs";
import { ACADEMIC_YEAR_LABEL } from "@/config/app";
import { leaveDays, leaveTypeName, overlaps, saveLeave, useLeaveApplications, withdrawLeave } from "@/features/leave/store";
import { HOLIDAYS } from "@/mocks/fixture";
import { LEAVE_TYPES, SUBSTITUTES } from "@/mocks/catalog";
import { toDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "apply", label: "Apply" },
  { id: "balance", label: "Balance" },
  { id: "history", label: "History" },
  { id: "calendar", label: "Calendar" },
  { id: "substitutes", label: "Substitutes" },
  { id: "policy", label: "Policy" },
  { id: "reports", label: "Reports" },
];

const STATUS_VARIANT = {
  DRAFT: "default",
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  WITHDRAWN: "info",
} as const;

export function LeavePage() {
  const applications = useLeaveApplications();
  const [tab, setTab] = useState("overview");
  const [selected, setSelected] = useState<string | null>(applications[0]?.id ?? null);
  const pending = applications.filter((item) => item.status === "PENDING").length;
  const approvedUpcoming = applications.filter((item) => item.status === "APPROVED" && item.end >= "2026-10-21");
  const used = applications.filter((item) => item.status === "APPROVED").reduce((sum, item) => sum + item.days, 0);

  return (
    <PageContainer
      title="Leave"
      description={`Your applications for ${ACADEMIC_YEAR_LABEL}. Approval stays with the school.`}
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Leave" }]}
    >
      <MockCaption>Sample entitlements and decisions. Nothing on this page is sent to the school or approved by an administrator.</MockCaption>
      <Tabs value={tab} onChange={setTab} options={TABS} />
      {tab === "overview" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Summary label="Sample balance" value="21.5 days" />
          <Summary label="Used in this list" value={`${used} days`} />
          <Summary label="Pending requests" value={String(pending)} />
          <Summary label="Upcoming approved" value={String(approvedUpcoming.length)} />
        </div>
      ) : null}
      {tab === "apply" ? <ApplyForm onDone={() => setTab("history")} /> : null}
      {tab === "balance" ? <Balance used={used} pending={pending} /> : null}
      {tab === "history" ? (
        <History
          selected={selected}
          onSelect={setSelected}
          onWithdraw={(id) => {
            const ok = withdrawLeave(id);
            toast[ok ? "success" : "error"](
              ok ? "Withdrawn in this browser only." : "This sample request can no longer be withdrawn.",
            );
          }}
        />
      ) : null}
      {tab === "calendar" ? <LeaveCalendar /> : null}
      {tab === "substitutes" ? <Substitutes /> : null}
      {tab === "policy" ? <Policy /> : null}
      {tab === "reports" ? <Reports /> : null}
    </PageContainer>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-2 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

const FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/heic", "image/heif"];

function ApplyForm({ onDone }: { onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [typeId, setTypeId] = useState<string>(LEAVE_TYPES[0].id);
  const [halfDay, setHalfDay] = useState(false);
  const [halfSession, setHalfSession] = useState<"first" | "second" | "">("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const leaveEnd = halfDay ? start : end;
  const days = start && leaveEnd ? leaveDays(start, leaveEnd, halfDay) : 0;
  const selectedType = LEAVE_TYPES.find((type) => type.id === typeId);

  function onFile(file: File | undefined) {
    if (!file) return;
    const allowed = FILE_TYPES.includes(file.type) || /\.(pdf|jpe?g|png|heic|heif)$/i.test(file.name);
    if (!allowed) {
      setFileName(null);
      setFileError("Use a JPEG, PNG, HEIC, HEIF, or PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileName(null);
      setFileError("The file must be 5 MB or smaller.");
      return;
    }
    setFileError(null);
    setFileName(file.name);
  }

  function submit(status: "DRAFT" | "PENDING") {
    if (!start || !leaveEnd || days <= 0) {
      setError("Choose a start date and an end date on or after it.");
      return;
    }
    if (halfDay && !halfSession) {
      setError("Choose the first half or the second half.");
      return;
    }
    if (reason.trim().length < 8) {
      setError("Enter a reason of at least 8 characters.");
      return;
    }
    if (fileError) return;
    if (status === "PENDING" && overlaps(start, leaveEnd)) {
      setError("These dates overlap a pending or approved sample request.");
      return;
    }
    saveLeave({
      typeId,
      typeName: leaveTypeName(typeId),
      halfDay,
      halfSession: halfDay ? halfSession || null : null,
      start,
      end: leaveEnd,
      days,
      reason: reason.trim(),
      status,
      fileName,
    });
    toast.success(status === "DRAFT" ? "Draft kept in this browser only." : "Submitted in this browser only. The school has not received it.");
    onDone();
  }

  return (
    <form className="grid gap-4 lg:grid-cols-2" onSubmit={(event) => { event.preventDefault(); submit("PENDING"); }}>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Leave type</span>
        <select className="h-11 w-full rounded-lg border border-input bg-card px-3" value={typeId} onChange={(event) => setTypeId(event.target.value)}>
          {LEAVE_TYPES.map((type) => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
        {selectedType ? <span className="text-xs text-muted-foreground">Sample entitlement: {selectedType.allocated} days. This is not a live balance.</span> : null}
      </label>
      <fieldset className="space-y-2 text-sm">
        <legend className="font-medium">Duration</legend>
        <label className="mr-4 inline-flex items-center gap-2">
          <input type="radio" name="duration" checked={!halfDay} onChange={() => { setHalfDay(false); setHalfSession(""); }} />
          Full day
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="radio" name="duration" checked={halfDay} onChange={() => setHalfDay(true)} />
          Half day
        </label>
        {halfDay ? (
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="half" checked={halfSession === "first"} onChange={() => setHalfSession("first")} />
              First half
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="half" checked={halfSession === "second"} onChange={() => setHalfSession("second")} />
              Second half
            </label>
          </div>
        ) : null}
      </fieldset>
      <Input label="Start date" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
      <Input label="End date" type="date" value={halfDay ? start : end} disabled={halfDay} onChange={(event) => setEnd(event.target.value)} />
      <p className="text-sm lg:col-span-2">Requested days: <strong>{days || "—"}</strong>. Half days stay in this browser. The school record stores whole dates.</p>
      <label className="flex flex-col gap-1.5 text-sm lg:col-span-2">
        <span className="font-medium">Reason</span>
        <textarea className="min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2" value={reason} onChange={(event) => setReason(event.target.value)} />
      </label>
      <div className="space-y-2 text-sm lg:col-span-2">
        <p className="font-medium">Supporting document</p>
        <input ref={fileRef} type="file" className="sr-only" accept="application/pdf,image/jpeg,image/png,image/heic,image/heif,.heic,.heif" onChange={(event) => onFile(event.target.files?.[0])} />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>{fileName ? "Replace file" : "Choose file"}</Button>
          {fileName ? <span>{fileName}</span> : <span className="text-muted-foreground">No file selected</span>}
          {fileName ? <Button type="button" variant="ghost" onClick={() => { setFileName(null); if (fileRef.current) fileRef.current.value = ""; }}>Remove</Button> : null}
        </div>
        <p className="text-xs text-muted-foreground">JPEG, PNG, HEIC, HEIF, or PDF. Maximum 5 MB. The name stays in this browser and is not uploaded.</p>
        {fileError ? <p className="text-sm text-danger" role="alert">{fileError}</p> : null}
      </div>
      {error ? <p className="text-sm text-danger lg:col-span-2" role="alert">{error}</p> : null}
      <div className="flex flex-wrap gap-2 lg:col-span-2">
        <Button type="button" variant="secondary" onClick={() => submit("DRAFT")}>Save draft</Button>
        <Button type="submit">Apply for leave</Button>
      </div>
    </form>
  );
}

function Balance({ used, pending }: { used: number; pending: number }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Leave year {ACADEMIC_YEAR_LABEL}. Allocations below are sample policy figures.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2">Type</th>
              <th>Allocated</th>
              <th>Used</th>
              <th>Pending</th>
              <th>Remaining</th>
            </tr>
          </thead>
          <tbody>
            {LEAVE_TYPES.map((type) => (
              <tr key={type.id} className="border-b border-border">
                <td className="py-2">{type.name}</td>
                <td>{type.allocated}</td>
                <td>{type.id === "sick" ? Math.min(used, type.allocated) : 0}</td>
                <td>{type.id === "casual" ? pending : 0}</td>
                <td>{type.allocated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function History({
  selected,
  onSelect,
  onWithdraw,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
  onWithdraw: (id: string) => void;
}) {
  const applications = useLeaveApplications();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [year, setYear] = useState(ACADEMIC_YEAR_LABEL);
  const rows = applications.filter((item) => {
    const matchesStatus = status === "ALL" || item.status === status;
    const matchesQuery = `${item.reference} ${item.typeName} ${item.reason}`.toLowerCase().includes(query.toLowerCase());
    const matchesYear = leaveYear(item.start) === year;
    return matchesStatus && matchesQuery && matchesYear;
  });
  const current = rows.find((item) => item.id === selected) ?? rows[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input label="Search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Reference or reason" />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Leave year</span>
            <select className="h-11 rounded-lg border border-input bg-card px-3" value={year} onChange={(event) => setYear(event.target.value)}>
              {[ACADEMIC_YEAR_LABEL, previousLeaveYear(ACADEMIC_YEAR_LABEL)].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Status</span>
            <select className="h-11 rounded-lg border border-input bg-card px-3" value={status} onChange={(event) => setStatus(event.target.value)}>
              {["ALL", "DRAFT", "PENDING", "APPROVED", "REJECTED", "WITHDRAWN"].map((value) => (
                <option key={value} value={value}>{value === "ALL" ? "All statuses" : value[0] + value.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2">Reference</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
              <tr><td className="py-3 text-muted-foreground" colSpan={5}>No applications in {year}.</td></tr>
            ) : null}
            {rows.map((item) => (
                <tr key={item.id} className="cursor-pointer border-b border-border" onClick={() => onSelect(item.id)}>
                  <td className="py-2 font-medium">{item.reference}</td>
                  <td>{item.typeName}</td>
                  <td>{item.start} – {item.end}</td>
                  <td>{item.days}</td>
                  <td><Badge variant={STATUS_VARIANT[item.status]}>{item.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {current ? (
        <Card>
          <CardContent className="space-y-2">
            <h2 className="font-semibold">{current.reference}</h2>
            <p className="text-sm">{current.typeName} · {current.start} – {current.end} · {current.days} {current.days === 1 ? "day" : "days"}{current.halfDay ? ` · ${current.halfSession === "second" ? "Second" : "First"} half` : ""}</p>
            <p className="text-sm">{current.reason}</p>
            <p className="text-xs text-muted-foreground">Applied {current.appliedOn} · Leave year {leaveYear(current.start)}{current.decisionOn ? ` · Decision ${current.decisionOn}` : ""}</p>
            <p className="text-sm">{current.remarks || "No decision remarks."}</p>
            <ol className="space-y-1 text-xs text-muted-foreground">
              <li>Submitted · {current.appliedOn}</li>
              <li>Status · {current.status}</li>
              {current.decisionOn ? <li>Recorded · {current.decisionOn}</li> : null}
            </ol>
            {current.status === "PENDING" || current.status === "DRAFT" ? (
              <Button variant="outline" onClick={() => onWithdraw(current.id)}>Withdraw</Button>
            ) : (
              <p className="text-xs text-muted-foreground">Withdrawal is available only for a draft or a pending request.</p>
            )}
            <p className="text-xs text-muted-foreground">There is no approve action. You cannot decide your own leave.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function LeaveCalendar() {
  const applications = useLeaveApplications();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date(2026, 9, 1)));
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  });
  const marks = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of applications) {
      if (item.status !== "APPROVED" && item.status !== "PENDING") continue;
      const from = new Date(`${item.start}T00:00:00`);
      const to = new Date(`${item.end}T00:00:00`);
      for (let date = from; date <= to; date = new Date(date.getTime() + 86_400_000)) {
        map.set(toDateKey(date), item.status);
      }
    }
    return map;
  }, [applications]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCursor(addMonths(cursor, -1))}>Previous</Button>
        <h2 className="text-sm font-semibold">{format(cursor, "MMMM yyyy")}</h2>
        <Button variant="outline" onClick={() => setCursor(addMonths(cursor, 1))}>Next</Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => <div key={label}>{label}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = toDateKey(day);
          const holiday = HOLIDAYS[key];
          const leave = marks.get(key);
          return (
            <div key={key} className={cn("min-h-16 rounded-lg border p-1.5 text-xs", holiday ? "border-danger bg-danger-muted text-danger" : "border-border bg-card")}>
              <span className={cn("font-medium", holiday && "text-danger")}>{format(day, "d")}</span>
              {holiday ? <span className="mt-1 block font-semibold leading-snug text-danger">Holiday · {holiday}</span> : null}
              {leave ? <span className="mt-1 block">{leave === "APPROVED" ? "Approved leave" : "Pending leave"}</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Substitutes() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">View only. You cannot assign or change a substitute.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2">Date</th>
              <th>Period</th>
              <th>Class</th>
              <th>Room</th>
              <th>Substitute</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {SUBSTITUTES.map((row) => (
              <tr key={`${row.date}-${row.period}`} className="border-b border-border">
                <td className="py-2">{row.date}</td>
                <td>{row.period}</td>
                <td>{row.className} · {row.subject}</td>
                <td>{row.room}</td>
                <td>
                  {row.teacher === "Not assigned" || row.teacher === "—" ? row.teacher : (
                    <TeacherIdentity teacher={substituteTeacher(row.teacher)} variant="compact" />
                  )}
                </td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Policy() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Read only. Leave year {ACADEMIC_YEAR_LABEL}. Entitlements are sample policy figures, not a live balance.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2">Leave type</th>
              <th>Sample entitlement</th>
            </tr>
          </thead>
          <tbody>
            {LEAVE_TYPES.map((type) => (
              <tr key={type.id} className="border-b border-border">
                <td className="py-2">{type.name}</td>
                <td>{type.allocated} days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
        <li>A half day is the first or second half of one date.</li>
        <li>A pending or draft request can be withdrawn here. An approved request cannot.</li>
        <li>This portal does not approve leave and does not assign substitute teachers.</li>
      </ul>
    </div>
  );
}

function Reports() {
  const applications = useLeaveApplications().filter((item) => leaveYear(item.start) === ACADEMIC_YEAR_LABEL);
  const used = applications.filter((item) => item.status === "APPROVED").reduce((sum, item) => sum + item.days, 0);
  const pending = applications.filter((item) => item.status === "PENDING").reduce((sum, item) => sum + item.days, 0);
  const allocated = LEAVE_TYPES.reduce((sum, type) => sum + type.allocated, 0);
  const remaining = Math.max(allocated - used - pending, 0);
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Summary for Meera Iyer in leave year {ACADEMIC_YEAR_LABEL}. Allocated days are the sample policy total, not a payroll balance.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Summary label="Sample allocated" value={`${allocated} days`} />
        <Summary label="Used in this list" value={`${used} days`} />
        <Summary label="Pending" value={`${pending} days`} />
        <Summary label="Sample remaining" value={`${remaining} days`} />
      </div>
      <Button variant="outline" onClick={() => window.print()}>Print summary</Button>
    </div>
  );
}

function leaveYear(date: string) {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  const start = month >= 4 ? year : year - 1;
  return `${start}–${String((start + 1) % 100).padStart(2, "0")}`;
}

function previousLeaveYear(label: string) {
  const start = Number(label.slice(0, 4)) - 1;
  return `${start}–${String((start + 1) % 100).padStart(2, "0")}`;
}

function substituteTeacher(name: string): TeacherInfo {
  return { name, designation: "Teacher", department: "Cover" };
}
