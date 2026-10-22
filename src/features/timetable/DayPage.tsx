"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { addDays, format, parseISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { TeacherIdentity } from "@/components/teacher/TeacherIdentity";
import { PageContainer } from "@/components/layout/PageContainer";
import { SIGNED_IN_TEACHER } from "@/config/teacher";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/EmptyState";
import { formatLongDate, toDateKey } from "@/lib/dates";
import { getPortalRepository } from "@/repositories";

export function DayPage() {
  const params = useSearchParams();
  const router = useRouter();
  const date = params.get("date") ?? toDateKey(new Date());
  const query = useQuery({
    queryKey: ["day", date],
    queryFn: () => getPortalRepository().getDay(date),
  });
  const current = parseISO(date);

  function shift(days: number) {
    router.push(`/app/day?date=${toDateKey(addDays(current, days))}`);
  }

  return (
    <PageContainer
      title="My day"
      description="Periods published for you. This timetable is a design fixture."
      actions={
        <Link href="/app/timetable" className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium">
          View week
        </Link>
      }
    >
      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => shift(-1)} aria-label="Previous day">
          Previous
        </Button>
        <p className="text-center text-sm font-medium">{formatLongDate(current)}</p>
        <Button variant="outline" onClick={() => shift(1)} aria-label="Next day">
          Next
        </Button>
      </div>
      {query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : query.data?.holiday ? (
        <Card className="border-danger bg-danger-muted">
          <CardContent>
            <p className="text-xs font-semibold text-danger">Holiday</p>
            <h2 className="text-lg font-semibold text-danger">{query.data.holiday}</h2>
            <p className="text-sm text-muted-foreground">The school is closed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(query.data?.periods ?? []).length === 0 && !query.isLoading ? (
            <p className="text-sm text-muted-foreground">No periods on this date.</p>
          ) : null}
          {query.data?.periods.map((period) => (
            <Card key={period.id}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{period.subject?.trim() ? period.subject : "Subject not listed"}</p>
                  <p className="text-sm text-muted-foreground">
                    Class {period.gradeLabel.replace("Grade ", "")} · Section {period.section} · {period.start}–{period.end} · Room {period.room}
                  </p>
                  <TeacherIdentity teacher={SIGNED_IN_TEACHER} variant="compact" className="mt-2" />
                </div>
                <div className="flex gap-2">
                  <Link href={`/app/students?grade=${period.gradeLabel.replace("Grade ", "")}&section=${period.section}`} className="inline-flex h-11 items-center rounded-lg border border-border px-3 text-sm">
                    Students
                  </Link>
                  <Link href={`/app/homework?assignment=${period.assignmentId}`} className="inline-flex h-11 items-center rounded-lg border border-border px-3 text-sm">
                    Homework
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {query.isLoading ? <p className="text-sm text-muted-foreground">Loading the day…</p> : null}
        </div>
      )}
      <p className="text-xs text-muted-foreground">{format(current, "yyyy-MM-dd")}</p>
    </PageContainer>
  );
}
