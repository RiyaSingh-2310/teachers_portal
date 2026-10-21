"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { homeworkStatusLabel } from "@/features/homework/status-label";
import { ASSIGNMENTS } from "@/mocks/fixture";
import { formatTimeLabel } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { getPortalRepository } from "@/repositories";
import type { HomeworkStatus } from "@/types/domain";

const LIMIT = 10;
const FILTERS = ["all", "DRAFT", "PUBLISHED", "CLOSED", "needs-review"] as const;

export function HomeworkListPage() {
  const params = useSearchParams();
  const router = useRouter();
  const status = (params.get("status") ?? "all") as HomeworkStatus | "needs-review" | "all";
  const assignment = params.get("assignment") ?? "all";
  const page = Number(params.get("page") ?? "1");
  const [searchInput, setSearchInput] = useState(params.get("q") ?? "");
  const [search, setSearch] = useState(params.get("q") ?? "");

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  function push(next: { status?: string; assignment?: string; page?: number; q?: string }) {
    const query = new URLSearchParams();
    const nextStatus = next.status ?? status;
    const nextAssignment = next.assignment ?? assignment;
    const nextPage = next.page ?? 1;
    const text = next.q ?? search;
    if (nextStatus !== "all") query.set("status", nextStatus);
    if (nextAssignment !== "all") query.set("assignment", nextAssignment);
    if (text) query.set("q", text);
    if (nextPage > 1) query.set("page", String(nextPage));
    router.push(`/app/homework${query.size ? `?${query}` : ""}`);
  }

  const query = useQuery({
    queryKey: ["homework", search, status, assignment, page],
    queryFn: () =>
      getPortalRepository().listHomework({
        search,
        status,
        assignmentId: assignment,
        page,
        limit: LIMIT,
      }),
  });

  return (
    <PageContainer
      title="Homework"
      description="Work you set for your classes. New tasks stay in this browser session only."
      actions={
        <Link href="/app/homework/new" className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-brand-foreground">
          New homework
        </Link>
      }
    >
      <input
        value={searchInput}
        onChange={(event) => {
          setSearchInput(event.target.value);
          push({ q: event.target.value.trim(), page: 1 });
        }}
        placeholder="Search by title"
        className="h-11 w-full max-w-xl rounded-lg border border-input bg-card px-3 text-sm"
        aria-label="Search by title"
      />
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => push({ status: value, page: 1 })}
            className={cn(
              "min-h-11 rounded-full border px-3 text-sm",
              status === value ? "border-brand bg-brand-muted text-brand" : "border-border",
            )}
          >
            {homeworkStatusLabel(value)}
          </button>
        ))}
      </div>
      <Dropdown
        label="Class"
        value={assignment}
        onChange={(value) => push({ assignment: value, page: 1 })}
        options={[
          { value: "all", label: "All classes" },
          ...ASSIGNMENTS.map((item) => ({
            value: item.id,
            label: `${item.gradeLabel} ${item.section}`,
          })),
        ]}
      />
      {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
      {query.data && query.data.total === 0 ? (
        <EmptyState title="No homework yet" description="Nothing matches this filter." />
      ) : null}
      <div className="space-y-3">
        {query.data?.items.map((task) => (
          <Link key={task.id} href={`/app/homework/${task.id}`} className="block">
            <Card>
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{task.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {task.gradeLabel} {task.section} · {task.subject}
                      {task.dueAt ? ` · Due ${formatTimeLabel(task.dueAt)}` : " · No due date"}
                    </p>
                  </div>
                  <Badge variant={task.status === "PUBLISHED" ? "success" : task.status === "DRAFT" ? "default" : "info"}>
                    {homeworkStatusLabel(task.status)}
                  </Badge>
                </div>
                {task.status !== "DRAFT" ? (
                  <p className="mt-2 text-sm">
                    {task.submitted} of {task.studentCount} submitted
                    {task.unreviewed > 0 ? ` · ${task.unreviewed} to review` : ""}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
