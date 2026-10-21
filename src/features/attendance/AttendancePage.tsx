"use client";

import { useQuery } from "@tanstack/react-query";
import { addDays, format, parseISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dropdown } from "@/components/ui/Dropdown";
import { ASSIGNMENTS } from "@/mocks/fixture";
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
  const section = params.get("section") ?? ASSIGNMENTS[0].id;
  const date = params.get("date") ?? toDateKey(new Date());
  const query = useQuery({
    queryKey: ["attendance", section, date],
    queryFn: () => getPortalRepository().getRegister(section, date),
  });

  function update(next: { section?: string; date?: string }) {
    const queryString = new URLSearchParams({
      section: next.section ?? section,
      date: next.date ?? date,
    });
    router.push(`/app/attendance?${queryString}`);
  }

  const rows = query.data?.rows ?? [];
  const tally = rows.reduce(
    (counts, row) => {
      counts[row.status] += 1;
      return counts;
    },
    { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 },
  );

  return (
    <PageContainer title="Attendance" description="One status per student per day. This register is a design fixture and cannot be saved.">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Dropdown
          label="Section"
          value={section}
          onChange={(value) => update({ section: value })}
          options={ASSIGNMENTS.map((assignment) => ({
            value: assignment.id,
            label: `${assignment.gradeLabel} · ${assignment.section}`,
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
          <div key={row.studentId} className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2">
            <div>
              <p className="text-sm font-medium">{row.name}</p>
              <p className="text-xs text-muted-foreground">Roll {row.rollNumber}</p>
            </div>
            <Badge variant={STATUS_VARIANT[row.status]}>{STATUS_LABEL[row.status]}</Badge>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
