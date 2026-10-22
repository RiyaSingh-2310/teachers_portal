"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MockCaption } from "@/components/ui/MockCaption";
import { EXAM_PAPERS, MARK_ROWS } from "@/mocks/catalog";

export function ExamsPage() {
  return (
    <PageContainer
      title="Examinations"
      description="Papers for classes you teach. You cannot publish results."
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Examinations" }]}
      actions={<Link href="/app/exams/marks" className="text-sm font-medium text-brand">Enter marks</Link>}
    >
      <MockCaption>Schedule rows are fixtures. Entry is not connected to the exam office.</MockCaption>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2">Exam</th>
              <th>Class</th>
              <th>When</th>
              <th>Room</th>
              <th>Max</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {EXAM_PAPERS.map((paper) => (
              <tr key={paper.id} className="border-b border-border">
                <td className="py-2 font-medium">{paper.name}</td>
                <td>{paper.grade}</td>
                <td>{paper.when}</td>
                <td>{paper.room}</td>
                <td>{paper.maxTheory + paper.maxPractical}</td>
                <td><Badge variant={paper.status === "Entry open" ? "success" : "default"}>{paper.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-muted-foreground">Question papers stay with the exam office. This portal does not offer an upload.</p>
    </PageContainer>
  );
}

export function MarksPage() {
  const paper = EXAM_PAPERS[0];
  const [theory, setTheory] = useState<Record<string, string>>({});
  const [practical, setPractical] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    for (const row of MARK_ROWS) {
      const theoryMark = Number(theory[row.id] ?? "");
      const practicalMark = Number(practical[row.id] ?? "0");
      if (theory[row.id] === undefined || theory[row.id] === "" || Number.isNaN(theoryMark)) next[row.id] = "Enter theory marks.";
      else if (theoryMark < 0 || theoryMark > paper.maxTheory) next[row.id] = `Theory must be 0–${paper.maxTheory}.`;
      else if (practicalMark < 0 || practicalMark > paper.maxPractical) next[row.id] = `Practical must be 0–${paper.maxPractical}.`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  return (
    <PageContainer
      title="Marks entry"
      description={`${paper.name} · ${paper.grade} · draft only`}
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Examinations", href: "/app/exams" }, { label: "Marks" }]}
    >
      <MockCaption>Marks stay in this browser. They are not verified or published.</MockCaption>
      <div className="space-y-3">
        {MARK_ROWS.map((row) => {
          const theoryMark = Number(theory[row.id] || 0);
          const practicalMark = Number(practical[row.id] || 0);
          const total = theoryMark + practicalMark;
          const max = paper.maxTheory + paper.maxPractical;
          const percent = max ? Math.round((total / max) * 100) : 0;
          return (
            <div key={row.id} className="grid gap-3 rounded-xl border border-border bg-card p-3 md:grid-cols-[1fr_8rem_8rem_6rem]">
              <div>
                <p className="text-sm font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">Roll {row.roll}</p>
                {errors[row.id] ? <p className="text-xs text-danger">{errors[row.id]}</p> : null}
              </div>
              <Input label="Theory" type="number" value={theory[row.id] ?? ""} onChange={(event) => setTheory((current) => ({ ...current, [row.id]: event.target.value }))} />
              <Input label="Practical" type="number" value={practical[row.id] ?? ""} onChange={(event) => setPractical((current) => ({ ...current, [row.id]: event.target.value }))} />
              <p className="self-end text-sm">{Number.isNaN(percent) ? "—" : `${percent}%`}</p>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => { if (validate()) toast.success("Draft kept in this browser only."); }}>Save draft</Button>
        <Button onClick={() => { if (validate()) toast.success("Marked submitted in this browser only. The exam office has not received it."); }}>Submit</Button>
      </div>
    </PageContainer>
  );
}
