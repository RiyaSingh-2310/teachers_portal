"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MockCaption } from "@/components/ui/MockCaption";
import { BEHAVIOUR } from "@/mocks/catalog";

const CATEGORIES = ["Positive achievement", "Participation", "Academic remark", "Follow-up"];

export function BehaviourPage() {
  const [rows, setRows] = useState(BEHAVIOUR);
  const [student, setStudent] = useState("Kabir Menon");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState("");

  return (
    <PageContainer
      title="Behaviour and remarks"
      description="Notes for students you teach. Unrelated classes are not listed."
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Behaviour" }]}
    >
      <MockCaption>These notes are fixtures. Discipline files and parent-contact notes are not stored.</MockCaption>
      <form
        className="grid max-w-xl gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (note.trim().length < 8) return;
          setRows((current) => [{ id: `b-${Date.now()}`, student, date: "21 Oct 2026", category, note: note.trim(), followUp: "Open" }, ...current]);
          setNote("");
          toast.success("Note kept in this browser only.");
        }}
      >
        <Input label="Student" value={student} onChange={(event) => setStudent(event.target.value)} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Category</span>
          <select className="h-11 rounded-lg border border-input bg-card px-3" value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Note</span>
          <textarea className="min-h-24 rounded-lg border border-input bg-card px-3 py-2" value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        <Button type="submit">Add note</Button>
      </form>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl border border-border bg-card px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{row.student}</p>
              <Badge>{row.category}</Badge>
            </div>
            <p className="mt-1 text-sm">{row.note}</p>
            <p className="text-xs text-muted-foreground">{row.date} · Follow-up: {row.followUp}</p>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
