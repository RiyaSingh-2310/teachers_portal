"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { addDays, format, parseISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { TeacherIdentity } from "@/components/teacher/TeacherIdentity";
import { PageContainer } from "@/components/layout/PageContainer";
import { SIGNED_IN_TEACHER } from "@/config/teacher";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { MockCaption } from "@/components/ui/MockCaption";
import { Tabs } from "@/components/ui/Tabs";
import { ASSIGNMENTS } from "@/mocks/fixture";
import { SHORT_ATTENDANCE, STAFF_ATTENDANCE } from "@/mocks/catalog";
import { toDateKey } from "@/lib/dates";
import { getPortalRepository } from "@/repositories";
import type { AttendanceStatus } from "@/types/domain";

const STATUS_VARIANT = {
  PRESENT: "success",
  ABSENT: "danger",
  LATE: "warning",
  EXCUSED: "info",
} as const;

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  EXCUSED: "Excused",
};

export function AttendancePage() {
  const params = useSearchParams();
  const router = useRouter();
  const grade = params.get("grade") ?? "all";
  const date = params.get("date") ?? toDateKey(new Date());
  const view = params.get("view") ?? "students";
  const grades = [...new Set(ASSIGNMENTS.map((item) => item.gradeLabel.replace("Grade ", "")))];
  const sections = ASSIGNMENTS.filter((item) => grade === "all" || item.gradeLabel.replace("Grade ", "") === grade);
  const section = sections.some((item) => item.id === params.get("section")) ? params.get("section")! : sections[0]?.id ?? ASSIGNMENTS[0].id;
  const [draft, setDraft] = useState<Record<string, AttendanceStatus>>({});
  const query = useQuery({
    queryKey: ["attendance", section, date],
    queryFn: () => getPortalRepository().getRegister(section, date),
  });

  function update(next: { section?: string; date?: string; grade?: string; view?: string }) {
    const nextGrade = next.grade ?? grade;
    const allowed = ASSIGNMENTS.filter((item) => nextGrade === "all" || item.gradeLabel.replace("Grade ", "") === nextGrade);
    const nextSection = allowed.some((item) => item.id === (next.section ?? section)) ? (next.section ?? section) : allowed[0]?.id ?? section;
    const queryString = new URLSearchParams({
      section: nextSection,
      date: next.date ?? date,
      view: next.view ?? view,
      grade: nextGrade,
    });
    router.push(`/app/attendance?${queryString}`);
  }

  const rows = (query.data?.rows ?? []).map((row) => ({
    ...row,
    status: draft[row.studentId] ?? row.status,
  }));
  const tally = rows.reduce(
    (counts, row) => {
      counts[row.status] += 1;
      return counts;
    },
    { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 },
  );

  return (
    <PageContainer
      title="Attendance"
      description="Student registers for your classes, and a sample of your own attendance."
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Attendance" }]}
    >
      <Tabs
        value={view}
        onChange={(next) => update({ view: next })}
        options={[
          { id: "students", label: "Student attendance" },
          { id: "mine", label: "My attendance" },
          { id: "history", label: "Attendance history" },
          { id: "monthly", label: "Monthly report" },
          { id: "corrections", label: "Correction requests" },
        ]}
      />
      {view === "mine" ? (
        <div className="space-y-3">
          <TeacherIdentity teacher={SIGNED_IN_TEACHER} variant="card" />
          <MockCaption>This is the signed-in teacher’s sample attendance. It is not a student register and it is not a punch record.</MockCaption>
          {STAFF_ATTENDANCE.map((row) => (
            <p key={row.month} className="text-sm">{row.month}: {row.present} present, {row.late} late, {row.leave} leave, {row.percent}%.</p>
          ))}
        </div>
      ) : null}
      {view === "history" ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Open a date to see the student register for the class selected on Student attendance.</p>
          {[-4, -3, -2, -1, 0].map((offset) => {
            const key = toDateKey(addDays(parseISO(date), offset));
            return (
              <button key={key} type="button" className="block w-full rounded-xl border border-border bg-card px-3 py-3 text-left text-sm" onClick={() => update({ date: key, view: "students" })}>
                {format(parseISO(key), "EEEE d MMM yyyy")}
              </button>
            );
          })}
        </div>
      ) : null}
      {view === "corrections" ? (
        <p className="text-sm text-muted-foreground">No correction requests. A request would go to the school office. You cannot approve one here.</p>
      ) : null}
      {view === "monthly" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">October sample: Grade 8 A is 89% present. This is the same fixture percentage shown on the dashboard, not a filed report.</p>
          <ul className="space-y-2">
            {SHORT_ATTENDANCE.map((row) => (
              <li key={row.name} className="rounded-xl border border-border bg-card px-3 py-3 text-sm">{row.name} · {row.className} · {row.percent}% present this month. Extra support, not a penalty list.</li>
            ))}
          </ul>
        </div>
      ) : null}
      {view !== "students" ? null : (
      <>
      <MockCaption>Status changes stay in this browser. The school has no class-teacher assignment, so Submit does not file the register.</MockCaption>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Dropdown
          label="Class"
          value={grade}
          onChange={(value) => update({ grade: value })}
          options={[{ value: "all", label: "All classes" }, ...grades.map((item) => ({ value: item, label: `Class ${item}` }))]}
        />
        <Dropdown
          label="Section"
          value={section}
          onChange={(value) => update({ section: value })}
          options={sections.map((assignment) => ({
            value: assignment.id,
            label: `${assignment.gradeLabel} · Section ${assignment.section}`,
          }))}
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => update({ date: toDateKey(addDays(parseISO(date), -1)) })}>
            Previous day
          </Button>
          <p className="text-sm font-medium">{format(parseISO(date), "d MMM yyyy")}</p>
          <Button
            variant="outline"
            disabled={date >= toDateKey(new Date())}
            onClick={() => update({ date: toDateKey(addDays(parseISO(date), 1)) })}
          >
            Next day
          </Button>
        </div>
      </div>
      <p className="rounded-xl border border-border bg-card px-3 py-2 text-sm" aria-live="polite">
        {tally.PRESENT} present · {tally.ABSENT} absent · {tally.LATE} late · {tally.EXCUSED} excused
      </p>
      <p className="text-sm text-muted-foreground">{query.data?.reason}</p>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.studentId} className="flex min-h-16 flex-col justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium">{row.name}</p>
              <p className="text-xs text-muted-foreground">Roll {row.rollNumber}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {(Object.keys(STATUS_LABEL) as AttendanceStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  className="rounded-full"
                  onClick={() => setDraft((current) => ({ ...current, [row.studentId]: status }))}
                >
                  <Badge variant={row.status === status ? STATUS_VARIANT[status] : "default"}>{STATUS_LABEL[status]}</Badge>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => toast.success("Draft kept in this browser only.")}>Save draft</Button>
        <Button onClick={() => toast.success("Not submitted to the school. Class-teacher assignment is not available.")}>Submit</Button>
      </div>
      </>
      )}
    </PageContainer>
  );
}
