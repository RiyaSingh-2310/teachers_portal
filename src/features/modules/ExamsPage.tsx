"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MockCaption } from "@/components/ui/MockCaption";
import { Dropdown } from "@/components/ui/Dropdown";
import { CLASS_SUBJECTS, type SubjectPaper } from "@/mocks/class-subjects";
import { marksPercentage, readMark } from "@/lib/marks";
import { EXAM_PAPERS } from "@/mocks/catalog";

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

interface MarkDraft {
  obtained: string;
  theory: string;
  practical: string;
}

function emptyDraft(): MarkDraft {
  return { obtained: "", theory: "", practical: "" };
}

function splitPaper(paper: SubjectPaper) {
  return paper.theoryMax !== undefined && paper.practicalMax !== undefined;
}

export function MarksPage() {
  const [classId, setClassId] = useState(CLASS_SUBJECTS[0]?.id ?? "");
  const [drafts, setDrafts] = useState<Record<string, MarkDraft>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("Not submitted");
  const selected = CLASS_SUBJECTS.find((item) => item.id === classId) ?? CLASS_SUBJECTS[0];

  function draftFor(id: string): MarkDraft {
    return drafts[id] ?? emptyDraft();
  }

  function updateDraft(id: string, partial: Partial<MarkDraft>) {
    setDrafts((current) => ({
      ...current,
      [id]: { ...emptyDraft(), ...current[id], ...partial },
    }));
    setErrors((current) => ({ ...current, [id]: "" }));
  }

  function score(paper: SubjectPaper) {
    const draft = draftFor(paper.id);
    if (splitPaper(paper)) {
      const theory = readMark(draft.theory);
      const practical = readMark(draft.practical);
      if (theory === null || practical === null) return { obtained: null, maximum: (paper.theoryMax ?? 0) + (paper.practicalMax ?? 0) };
      return { obtained: theory + practical, maximum: (paper.theoryMax ?? 0) + (paper.practicalMax ?? 0) };
    }
    return { obtained: readMark(draft.obtained), maximum: paper.maxMarks };
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!selected) next.class = "Select a class.";
    for (const paper of selected?.papers ?? []) {
      const draft = draftFor(paper.id);
      if (splitPaper(paper)) {
        const theory = readMark(draft.theory);
        const practical = readMark(draft.practical);
        if (theory === null) next[paper.id] = "Enter theory marks.";
        else if (theory < 0 || theory > (paper.theoryMax ?? 0)) next[paper.id] = `Theory must be 0–${paper.theoryMax}.`;
        else if (practical === null) next[paper.id] = "Enter practical marks.";
        else if (practical < 0 || practical > (paper.practicalMax ?? 0)) next[paper.id] = `Practical must be 0–${paper.practicalMax}.`;
      } else {
        const obtained = readMark(draft.obtained);
        if (obtained === null) next[paper.id] = "Enter obtained marks.";
        else if (obtained < 0) next[paper.id] = "Marks cannot be negative.";
        else if (obtained > paper.maxMarks) next[paper.id] = `Obtained marks cannot exceed ${paper.maxMarks}.`;
      }
    }
    setErrors(next);
    return Object.keys(next).filter((key) => next[key]).length === 0;
  }

  return (
    <PageContainer
      title="Marks entry"
      description={selected ? `${selected.label} ${selected.section} · subject papers from the class map · draft only` : "Select a class"}
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Examinations", href: "/app/exams" }, { label: "Marks" }]}
    >
      <MockCaption>Subject lists come from the class map in this browser. Marks are not sent to the exam office.</MockCaption>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Dropdown
          label="Class"
          value={classId}
          onChange={(value) => { setClassId(value); setErrors({}); setStatus("Not submitted"); }}
          options={CLASS_SUBJECTS.map((item) => ({ value: item.id, label: `${item.label} · Section ${item.section}` }))}
        />
        <p className="text-sm text-muted-foreground">Status: {status}</p>
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2">Subject</th>
              <th>Assessment</th>
              <th>Maximum</th>
              <th>Obtained</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {(selected?.papers ?? []).map((paper) => {
              const result = score(paper);
              return (
                <tr key={paper.id} className="border-b border-border align-top">
                  <td className="py-3 font-medium">{paper.subject}</td>
                  <td>{paper.examType}</td>
                  <td>{splitPaper(paper) ? `${paper.theoryMax} + ${paper.practicalMax}` : paper.maxMarks}</td>
                  <td className="min-w-56 pr-3">
                    {splitPaper(paper) ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input label={`Theory / ${paper.theoryMax}`} type="number" min={0} value={draftFor(paper.id).theory} onChange={(event) => updateDraft(paper.id, { theory: event.target.value })} />
                        <Input label={`Practical / ${paper.practicalMax}`} type="number" min={0} value={draftFor(paper.id).practical} onChange={(event) => updateDraft(paper.id, { practical: event.target.value })} />
                      </div>
                    ) : (
                      <Input label="Obtained" type="number" min={0} value={draftFor(paper.id).obtained} onChange={(event) => updateDraft(paper.id, { obtained: event.target.value })} />
                    )}
                    {errors[paper.id] ? <p className="mt-1 text-xs text-danger">{errors[paper.id]}</p> : null}
                  </td>
                  <td className="py-3">{result.obtained === null ? "—" : marksPercentage(result.obtained, result.maximum) ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {(selected?.papers ?? []).map((paper) => {
          const result = score(paper);
          return (
            <div key={paper.id} className="rounded-xl border border-border bg-card p-3">
              <p className="text-sm font-semibold">{paper.subject}</p>
              <p className="text-xs text-muted-foreground">{paper.examType} · max {paper.maxMarks}</p>
              {splitPaper(paper) ? (
                <div className="mt-3 grid gap-2">
                  <Input label={`Theory / ${paper.theoryMax}`} type="number" min={0} value={draftFor(paper.id).theory} onChange={(event) => updateDraft(paper.id, { theory: event.target.value })} />
                  <Input label={`Practical / ${paper.practicalMax}`} type="number" min={0} value={draftFor(paper.id).practical} onChange={(event) => updateDraft(paper.id, { practical: event.target.value })} />
                </div>
              ) : (
                <div className="mt-3">
                  <Input label="Obtained" type="number" min={0} value={draftFor(paper.id).obtained} onChange={(event) => updateDraft(paper.id, { obtained: event.target.value })} />
                </div>
              )}
              <p className="mt-2 text-sm">Percentage {result.obtained === null ? "—" : marksPercentage(result.obtained, result.maximum) ?? "—"}</p>
              {errors[paper.id] ? <p className="text-xs text-danger">{errors[paper.id]}</p> : null}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => { if (validate()) { setStatus("Draft saved in this browser"); toast.success("Draft kept in this browser only."); } }}>Save draft</Button>
        <Button onClick={() => { if (validate()) { setStatus("Submitted in this browser"); toast.success("Marked submitted in this browser only. The exam office has not received it."); } }}>Submit marks</Button>
      </div>
    </PageContainer>
  );
}
