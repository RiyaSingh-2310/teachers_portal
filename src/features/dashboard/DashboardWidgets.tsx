import Link from "next/link";
import { SectionHeader } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import type { PeriodState } from "@/features/dashboard/period-state";
import { formatRelative } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { DashboardSnapshot } from "@/repositories/types";
import type { PeriodSlot } from "@/types/domain";

export function TimetableCard({
  states,
}: {
  states: { period: PeriodSlot; state: PeriodState }[];
}) {
  return (
    <Card>
      <SectionHeader title="Today’s timetable" href="/app/day" meta="Published periods for you" />
      <CardContent className="space-y-2">
        {states.length === 0 ? (
          <p className="text-sm text-muted-foreground">No periods on this date.</p>
        ) : (
          states.map(({ period, state }) => (
            <Link
              key={period.id}
              href={`/app/classes/${period.assignmentId}`}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-3 hover:bg-muted",
                state === "now" && "border-l-4 border-l-accent",
                state === "done" && "text-muted-foreground",
              )}
            >
              <span>
                <span className="block text-sm font-medium">
                  Period {period.period} · {period.start}–{period.end}
                </span>
                <span className="block text-sm">
                  {period.gradeLabel} {period.section} · {period.subject}
                </span>
              </span>
              <span className="text-right text-xs">
                <span className="block">Room {period.room}</span>
                <span className="font-medium uppercase">{state === "now" ? "Now" : state}</span>
              </span>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function ClassesCard({ assignments }: { assignments: DashboardSnapshot["assignments"] }) {
  return (
    <Card>
      <SectionHeader title="Assigned classes" href="/app/classes" />
      <CardContent className="space-y-3">
        {assignments.map((assignment) => (
          <Link key={assignment.id} href={`/app/classes/${assignment.id}`} className="block rounded-lg hover:bg-muted">
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {assignment.gradeLabel} · Section {assignment.section}
              </span>
              <Badge variant={assignment.role === "Lead" ? "brand" : "default"}>{assignment.role}</Badge>
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {assignment.subject} · {assignment.studentCount} students
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export function AttendanceCard({ rows }: { rows: DashboardSnapshot["attendance"] }) {
  return (
    <Card>
      <SectionHeader title="Attendance summary" href="/app/attendance" />
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <p key={row.assignmentId} className="text-sm">
            <span className="font-medium">{row.label}</span>
            <span className="text-muted-foreground"> · {row.presentPercent}% present this month</span>
          </p>
        ))}
        <p className="text-xs text-muted-foreground">
          Daily marking stays with the class teacher. That duty is not available here yet, so this view is read-only.
        </p>
      </CardContent>
    </Card>
  );
}

export function AnnouncementsCard({ items }: { items: DashboardSnapshot["announcements"] }) {
  return (
    <Card>
      <SectionHeader title="Announcements" href="/app/messages" />
      <CardContent className="space-y-3">
        {items.map((item) => (
          <Link key={item.id} href={`/app/messages/${item.id}`} className="block">
            <span className="flex items-start gap-2">
              {item.unread ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" /> : <span className="mt-1.5 h-2 w-2 shrink-0" />}
              <span>
                <span className="block text-sm font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">{formatRelative(item.sentAt)}</span>
              </span>
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

export function ExamsCard({ exams }: { exams: DashboardSnapshot["exams"] }) {
  return (
    <Card>
      <SectionHeader title="Upcoming examinations" meta="Design fixture · entry is not open" />
      <CardContent className="space-y-3">
        {exams.map((exam) => (
          <div key={exam.id}>
            <p className="text-sm font-medium">
              {exam.examName} · {exam.gradeLabel} {exam.section}
            </p>
            <p className="text-xs text-muted-foreground">
              {exam.subject} · {new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(exam.startsAt))} · {exam.room}
            </p>
          </div>
        ))}
        <Link href="/app/exams" className="inline-flex text-sm font-medium text-brand hover:underline">
          Examinations are not open in this portal yet
        </Link>
      </CardContent>
    </Card>
  );
}
