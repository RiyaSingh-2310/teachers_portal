"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { ACADEMIC_YEAR_LABEL } from "@/config/app";
import { getPortalRepository } from "@/repositories";

export function ClassesPage() {
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["classes", search],
    queryFn: () => getPortalRepository().listAssignments(search),
  });

  return (
    <PageContainer
      title="My classes"
      description={`Classes and subjects assigned to you for ${ACADEMIC_YEAR_LABEL}.`}
    >
      <label className="relative block max-w-md">
        <span className="sr-only">Search classes</span>
        <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by class, section, or subject"
          className="h-11 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-sm"
        />
      </label>
      {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
      {query.data && query.data.length === 0 ? (
        <EmptyState title="No class matches that filter" description="Clear the search to see your teaching load." />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {query.data?.map((assignment) => (
          <Card key={assignment.id}>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    {assignment.gradeLabel} · Section {assignment.section}
                  </h2>
                  <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                </div>
                <Badge variant={assignment.role === "Lead" ? "brand" : "default"}>{assignment.role} teacher</Badge>
              </div>
              <p className="text-sm">
                {assignment.studentCount} students · {assignment.periodsPerWeek} periods this week
              </p>
              <div className="flex flex-wrap gap-2">
                <Link className="inline-flex h-11 items-center rounded-lg border border-border px-3 text-sm" href={`/app/students?grade=${assignment.grade}&section=${assignment.section}`}>
                  Students
                </Link>
                <Link className="inline-flex h-11 items-center rounded-lg border border-border px-3 text-sm" href="/app/timetable">
                  Timetable
                </Link>
                <Link className="inline-flex h-11 items-center rounded-lg border border-border px-3 text-sm" href={`/app/homework?assignment=${assignment.id}`}>
                  Homework
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
