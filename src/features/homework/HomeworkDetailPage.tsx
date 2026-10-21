"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { PermissionState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { getPortalRepository } from "@/repositories";

export function HomeworkDetailPage() {
  const params = useParams<{ homeworkId: string }>();
  const id = params.homeworkId;
  const queryClient = useQueryClient();
  const [activeStudent, setActiveStudent] = useState<string | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const taskQuery = useQuery({
    queryKey: ["homework", id],
    queryFn: () => getPortalRepository().getHomework(id),
  });
  const rowsQuery = useQuery({
    queryKey: ["submissions", id],
    queryFn: () => getPortalRepository().listSubmissions(id),
    enabled: Boolean(taskQuery.data),
  });
  const save = useMutation({
    mutationFn: () => getPortalRepository().saveFeedback(id, activeStudent ?? "", Number(score), feedback),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["submissions", id] });
      await queryClient.invalidateQueries({ queryKey: ["homework"] });
      toast.success("Feedback updated in this browser only. Not sent to the school.");
      setActiveStudent(null);
    },
  });

  if (taskQuery.isLoading) return <p className="text-sm text-muted-foreground">Loading homework…</p>;
  if (!taskQuery.data) return <PermissionState />;
  const task = taskQuery.data;
  const active = rowsQuery.data?.find((row) => row.studentId === activeStudent);

  return (
    <PageContainer
      title={task.title}
      description={`${task.gradeLabel} ${task.section} · ${task.subject}`}
      actions={
        <Link href="/app/homework" className="text-sm font-medium text-brand">
          Homework
        </Link>
      }
    >
      <p className="text-sm text-muted-foreground">{task.instructions}</p>
      {task.status !== "DRAFT" ? (
        <p className="text-sm">
          {task.submitted} submitted · {task.studentCount - task.submitted} not submitted
        </p>
      ) : (
        <Badge>Draft</Badge>
      )}
      <div className="space-y-2">
        {rowsQuery.data?.map((row) => (
          <div key={row.studentId} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-3">
            <div>
              <p className="text-sm font-medium">{row.studentName}</p>
              <p className="text-xs text-muted-foreground">
                Roll {row.rollNumber} · {row.status === "NOT_SUBMITTED" ? "Not submitted" : row.status === "SUBMITTED" ? "Submitted" : `Returned · ${row.score ?? "—"} / ${row.maxScore}`}
              </p>
            </div>
            <Button
              variant="outline"
              disabled={row.status === "NOT_SUBMITTED"}
              onClick={() => {
                setActiveStudent(row.studentId);
                setScore(row.score?.toString() ?? "");
                setFeedback(row.feedback);
              }}
            >
              Review
            </Button>
          </div>
        ))}
      </div>
      {active ? (
        <Card>
          <CardContent className="space-y-3">
            <h2 className="font-semibold">Review {active.studentName}</h2>
            <Input label="Score" type="number" min={0} max={10} value={score} onChange={(event) => setScore(event.target.value)} />
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Feedback</span>
              <textarea className="min-h-24 rounded-lg border border-input bg-card px-3 py-2" value={feedback} onChange={(event) => setFeedback(event.target.value)} />
            </label>
            <Button disabled={save.isPending || score === ""} onClick={() => save.mutate()}>
              Save feedback
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  );
}
