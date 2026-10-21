"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { ErrorState, PermissionState } from "@/components/ui/EmptyState";
import { getPortalRepository } from "@/repositories";

export function ClassDetailPage() {
  const params = useParams<{ assignmentId: string }>();
  const id = params.assignmentId;
  const query = useQuery({
    queryKey: ["class", id],
    queryFn: () => getPortalRepository().getAssignment(id),
    enabled: Boolean(id),
  });

  if (query.isLoading) return <p className="text-sm text-muted-foreground">Loading class…</p>;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  if (!query.data) return <PermissionState />;

  const assignment = query.data;
  return (
    <PageContainer
      title={`${assignment.gradeLabel} · Section ${assignment.section}`}
      description={`${assignment.subject} · You are the ${assignment.role.toLowerCase()} teacher for this subject.`}
      actions={
        <Link href="/app/classes" className="text-sm font-medium text-brand hover:underline">
          My classes
        </Link>
      }
    >
      <div className="flex flex-wrap gap-2">
        <Link className="inline-flex h-11 items-center rounded-lg bg-brand px-4 text-sm text-brand-foreground" href={`/app/students?grade=${assignment.grade}&section=${assignment.section}`}>
          Roll
        </Link>
        <Link className="inline-flex h-11 items-center rounded-lg border border-border px-4 text-sm" href="/app/timetable">
          This week
        </Link>
        <Link className="inline-flex h-11 items-center rounded-lg border border-border px-4 text-sm" href={`/app/homework?assignment=${assignment.id}`}>
          Homework
        </Link>
        <Link className="inline-flex h-11 items-center rounded-lg border border-border px-4 text-sm" href={`/app/attendance?section=${assignment.id}`}>
          Attendance
        </Link>
      </div>
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Stat label="Students" value={String(assignment.studentCount)} />
          <Stat label="Periods this week" value={String(assignment.periodsPerWeek)} />
          <Stat label="Subject" value={assignment.subject} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
