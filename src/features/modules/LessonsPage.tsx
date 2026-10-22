"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MockCaption } from "@/components/ui/MockCaption";
import { SYLLABUS } from "@/mocks/catalog";

interface Plan {
  id: string;
  title: string;
  date: string;
  chapter: string;
  status: "Draft" | "Submitted" | "Revision requested";
}

const INITIAL: Plan[] = [
  { id: "lp-1", title: "Solving equations in pairs", date: "2026-10-22", chapter: "Linear equations", status: "Submitted" },
  { id: "lp-2", title: "Plotting y = mx + c", date: "2026-10-23", chapter: "Graphs", status: "Draft" },
];

export function LessonsPage() {
  const [plans, setPlans] = useState(INITIAL);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [chapter, setChapter] = useState(SYLLABUS[0].chapter);
  const [error, setError] = useState<string | null>(null);

  function add(status: Plan["status"]) {
    if (title.trim().length < 4 || !date) {
      setError("Add a title and a lesson date.");
      return;
    }
    setPlans((current) => [{ id: `lp-${Date.now()}`, title: title.trim(), date, chapter, status }, ...current]);
    setTitle("");
    setError(null);
    toast.success(status === "Draft" ? "Draft kept in this browser only." : "Submitted in this browser only. No approver has reviewed it.");
  }

  return (
    <PageContainer
      title="Lesson plans"
      description="Daily plans for your mathematics classes. There is no approval button for your own plan."
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Curriculum", href: "/app/curriculum" }, { label: "Lesson plans" }]}
    >
      <MockCaption>Plans stay in this browser. The school has no lesson-plan record yet.</MockCaption>
      <form className="grid max-w-xl gap-3" onSubmit={(event) => { event.preventDefault(); add("Submitted"); }}>
        <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Input label="Lesson date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Chapter</span>
          <select className="h-11 rounded-lg border border-input bg-card px-3" value={chapter} onChange={(event) => setChapter(event.target.value)}>
            {SYLLABUS.map((item) => <option key={item.id}>{item.chapter}</option>)}
          </select>
        </label>
        <p className="text-xs text-muted-foreground">Class Grade 8 A · Mathematics · Method: worked example, then paired practice · 40 minutes.</p>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => add("Draft")}>Save draft</Button>
          <Button type="submit">Submit for review</Button>
        </div>
      </form>
      <ul className="space-y-2">
        {plans.map((plan) => (
          <li key={plan.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-3">
            <div>
              <p className="text-sm font-medium">{plan.title}</p>
              <p className="text-xs text-muted-foreground">{plan.date} · {plan.chapter}</p>
            </div>
            <Badge variant={plan.status === "Submitted" ? "info" : "default"}>{plan.status}</Badge>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
