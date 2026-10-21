"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ErrorState, PermissionState } from "@/components/ui/EmptyState";
import { getPortalRepository } from "@/repositories";

export function StudentDetailPage() {
  const params = useParams<{ studentId: string }>();
  const search = useSearchParams();
  const query = useQuery({
    queryKey: ["student", params.studentId],
    queryFn: () => getPortalRepository().getStudent(params.studentId),
  });
  const homework = useQuery({
    queryKey: ["homework", "student", query.data?.assignmentId],
    queryFn: () =>
      getPortalRepository().listHomework({
        assignmentId: query.data!.assignmentId,
        page: 1,
        limit: 10,
      }),
    enabled: Boolean(query.data),
  });

  if (query.isLoading) return <p className="text-sm text-muted-foreground">Loading student…</p>;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;
  if (!query.data) return <PermissionState />;

  const student = query.data;
  const back = new URLSearchParams();
  for (const key of ["grade", "section", "q"]) {
    const value = search.get(key);
    if (value) back.set(key, value);
  }

  return (
    <PageContainer
      title={student.name}
      description={`Roll ${student.rollNumber} · ${student.gradeLabel} · Section ${student.section} · 2026–27`}
      actions={
        <Link href={`/app/students${back.size ? `?${back}` : ""}`} className="text-sm font-medium text-brand hover:underline">
          Students
        </Link>
      }
    >
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Roll number" value={student.rollNumber} />
          <Field label="Class" value={`${student.gradeLabel} · Section ${student.section}`} />
          <Field label="Subject you teach" value={student.subject} />
          <Field label="Enrollment" value="Active" />
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h2 className="font-semibold">Attendance</h2>
            <p className="mt-2 text-sm">{student.attendancePercent}% present this month in this section.</p>
            <Link href={`/app/attendance?section=${student.assignmentId}`} className="mt-3 inline-flex text-sm font-medium text-brand">
              Full history
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h2 className="font-semibold">Homework</h2>
            <ul className="mt-2 space-y-2">
              {homework.data?.items.filter((task) => task.status !== "DRAFT").map((task) => (
                <li key={task.id}>
                  <Link href={`/app/homework/${task.id}`} className="text-sm font-medium text-brand">
                    {task.title}
                  </Link>
                  <Badge className="ml-2" variant={task.status === "PUBLISHED" ? "success" : "default"}>
                    {task.status === "PUBLISHED" ? "Published" : "Closed"}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
