"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { ACADEMIC_YEAR_LABEL } from "@/config/app";
import { cn } from "@/lib/utils";
import { getPortalRepository } from "@/repositories";

const LIMIT = 25;

export function StudentsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const grade = params.get("grade") ?? "all";
  const section = params.get("section") ?? "all";
  const page = Number(params.get("page") ?? "1");
  const initialSearch = params.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  function push(next: { grade?: string; section?: string; page?: number; q?: string }) {
    const query = new URLSearchParams();
    const g = next.grade ?? grade;
    const s = next.section ?? section;
    const p = next.page ?? 1;
    const text = next.q ?? search;
    if (g !== "all") query.set("grade", g);
    if (s !== "all") query.set("section", s);
    if (text) query.set("q", text);
    if (p > 1) query.set("page", String(p));
    router.push(`/app/students${query.size ? `?${query}` : ""}`);
  }

  const query = useQuery({
    queryKey: ["students", search, grade, section, page],
    queryFn: () =>
      getPortalRepository().listStudents({
        search,
        grade,
        section,
        page,
        limit: LIMIT,
      }),
  });

  const sections = grade === "6" ? ["A"] : grade === "7" ? ["B"] : grade === "8" ? ["A", "B"] : ["A", "B"];

  return (
    <PageContainer
      title="Students"
      description={`Students in your classes for ${ACADEMIC_YEAR_LABEL}.`}
    >
      <label className="relative block max-w-xl">
        <span className="sr-only">Search by name or roll number</span>
        <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
        <input
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            push({ q: event.target.value.trim(), page: 1 });
          }}
          placeholder="Search by name or roll number"
          className="h-11 w-full rounded-lg border border-input bg-card pr-3 pl-9 text-sm"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {["all", "6", "7", "8"].map((value) => (
          <FilterChip
            key={value}
            active={grade === value}
            onClick={() => push({ grade: value, section: "all", page: 1 })}
          >
            {value === "all" ? "All classes" : `Grade ${value}`}
          </FilterChip>
        ))}
        {sections.map((value) => (
          <FilterChip key={value} active={section === value} onClick={() => push({ section: value, page: 1 })}>
            Section {value}
          </FilterChip>
        ))}
        <FilterChip active={section === "all"} onClick={() => push({ section: "all", page: 1 })}>
          All sections
        </FilterChip>
      </div>
      {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
      {query.data && query.data.total === 0 ? (
        <EmptyState
          title="No student found"
          description="Check the name or roll number. You only see students in your classes."
        />
      ) : null}
      <div className="space-y-3 md:hidden">
        {query.data?.items.map((student) => (
          <StudentLink key={student.id} student={student} grade={grade} section={section} search={search} />
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Students in your classes</caption>
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 font-medium">Student</th>
              <th className="py-2 font-medium">Roll</th>
              <th className="py-2 font-medium">Class</th>
              <th className="py-2 font-medium">This month</th>
              <th className="py-2 font-medium">Open homework</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((student) => (
              <tr key={student.id} className="border-b border-border">
                <td className="py-3">
                  <Link href={studentHref(student.id, grade, section, search)} className="flex items-center gap-2 font-medium">
                    <Avatar name={student.name} />
                    {student.name}
                  </Link>
                </td>
                <td>{student.rollNumber}</td>
                <td>
                  {student.gradeLabel} · {student.section}
                </td>
                <td>{student.attendancePercent}% present</td>
                <td>{student.openHomework}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {query.data && query.data.total > 0 ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            Showing {(query.data.page - 1) * query.data.limit + 1}–{Math.min(query.data.page * query.data.limit, query.data.total)} of {query.data.total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={!query.data.hasPreviousPage} onClick={() => push({ page: page - 1, q: search })}>
              Previous
            </Button>
            <Button variant="outline" disabled={!query.data.hasNextPage} onClick={() => push({ page: page + 1, q: search })}>
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

function studentHref(id: string, grade: string, section: string, search: string) {
  const query = new URLSearchParams();
  if (grade !== "all") query.set("grade", grade);
  if (section !== "all") query.set("section", section);
  if (search) query.set("q", search);
  const suffix = query.size ? `?${query}` : "";
  return `/app/students/${id}${suffix}`;
}

function StudentLink({
  student,
  grade,
  section,
  search,
}: {
  student: { id: string; name: string; rollNumber: string; gradeLabel: string; section: string; attendancePercent: number; openHomework: number };
  grade: string;
  section: string;
  search: string;
}) {
  return (
    <Link href={studentHref(student.id, grade, section, search)} className="block rounded-xl border border-border bg-card p-4">
      <span className="font-medium">{student.name}</span>
      <span className="mt-1 block text-sm text-muted-foreground">
        Roll {student.rollNumber} · {student.gradeLabel} {student.section} · {student.attendancePercent}% present · {student.openHomework} open
      </span>
    </Link>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full border px-3 text-sm",
        active ? "border-brand bg-brand-muted text-brand" : "border-border bg-card",
      )}
    >
      {children}
    </button>
  );
}
