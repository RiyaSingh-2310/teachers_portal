"use client";

import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";
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

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "apply", label: "Apply" },
  { id: "balance", label: "Balance" },
  { id: "history", label: "History" },
  { id: "calendar", label: "Calendar" },
  { id: "substitutes", label: "Substitutes" },
  { id: "policy", label: "Policy" },
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

function ApplyForm({ onDone }: { onDone: () => void }) {
  const [typeId, setTypeId] = useState<string>(LEAVE_TYPES[0].id);
  const [halfDay, setHalfDay] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const days = start && end ? leaveDays(start, end, halfDay) : 0;

  function submit(status: "DRAFT" | "PENDING") {
    if (!start || !end || days <= 0) {
      setError("Choose a start date and an end date on or after it.");
      return;
    }
    if (halfDay && start !== end) {
      setError("A half day uses one date. Clear half day or use the same start and end.");
      return;
    }
    if (reason.trim().length < 8) {
      setError("Enter a reason of at least 8 characters.");
      return;
    }
    if (status === "PENDING" && overlaps(start, end)) {
      setError("These dates overlap a pending or approved sample request.");
      return;
    }
    saveLeave({
      typeId,
      typeName: leaveTypeName(typeId),
      halfDay,
      start,
      end,
      days,
      reason: reason.trim(),
      status,
      fileName,
    });
    toast.success(status === "DRAFT" ? "Draft kept in this browser only." : "Submitted in this browser only. The school has not received it.");
    onDone();
  }

  return (
    <form className="max-w-xl space-y-4" onSubmit={(event) => { event.preventDefault(); submit("PENDING"); }}>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Leave type</span>
        <select className="h-11 rounded-lg border border-input bg-card px-3" value={typeId} onChange={(event) => setTypeId(event.target.value)}>
          {LEAVE_TYPES.map((type) => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </label>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={halfDay} onChange={(event) => setHalfDay(event.target.checked)} />
        Half day (one date only). The school database does not store half days yet.
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Start date" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
        <Input label="End date" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
      </div>
      <p className="text-sm">Requested days: <strong>{days || "—"}</strong></p>
      <p className="text-xs text-muted-foreground">Affected sample periods: Grade 8 A Mathematics, Periods 1 and 2, Room 12. You cannot assign a substitute.</p>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Reason</span>
        <textarea className="min-h-24 rounded-lg border border-input bg-card px-3 py-2" value={reason} onChange={(event) => setReason(event.target.value)} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Supporting file (PDF or image, not uploaded)</span>
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
        />
      </label>
      {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={() => submit("DRAFT")}>Save draft</Button>
        <Button type="submit">Submit</Button>
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
  const rows = applications.filter((item) => {
    const matchesStatus = status === "ALL" || item.status === status;
    const matchesQuery = `${item.reference} ${item.typeName} ${item.reason}`.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesQuery;
  });
  const current = rows.find((item) => item.id === selected) ?? rows[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input label="Search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Reference or reason" />
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
            <p className="text-sm">{current.reason}</p>
            <p className="text-xs text-muted-foreground">Applied {current.appliedOn}{current.decisionOn ? ` · Decision ${current.decisionOn}` : ""}</p>
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
            <div key={key} className="min-h-16 rounded-lg border border-border bg-card p-1.5 text-xs">
              <span className="font-medium">{format(day, "d")}</span>
              {holiday ? <span className="mt-1 block text-info">Holiday · {holiday}</span> : null}
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
                <td>{row.teacher}</td>
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
    <ul className="max-w-2xl list-disc space-y-2 pl-5 text-sm text-muted-foreground">
      <li>Leave types and entitlements are set by the school. The numbers on this page are samples.</li>
      <li>Half-day leave is shown in the form, and the current database stores whole dates only.</li>
      <li>A pending or draft request can be withdrawn here. An approved request cannot.</li>
      <li>This portal does not approve leave and does not assign substitute teachers.</li>
    </ul>
  );
}
