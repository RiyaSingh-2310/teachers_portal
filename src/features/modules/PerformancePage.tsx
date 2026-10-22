"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { MockCaption } from "@/components/ui/MockCaption";
import { PERFORMANCE } from "@/mocks/catalog";

export function PerformancePage() {
  const [remark, setRemark] = useState("");
  const average = Math.round(PERFORMANCE.reduce((sum, row) => sum + row.exam, 0) / PERFORMANCE.length);
  return (
    <PageContainer
      title="Student performance"
      description="Grade 8 A mathematics. Support notes stay constructive."
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Examinations", href: "/app/exams" }, { label: "Performance" }]}
    >
      <MockCaption>Figures are fixtures for three named students, not a live result analysis.</MockCaption>
      <p className="text-sm">Class exam average in this sample: <strong>{average}%</strong></p>
      <div className="space-y-3">
        {PERFORMANCE.map((row) => (
          <div key={row.name} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">{row.name}</h2>
              <span className="text-sm">{row.exam}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-accent" style={{ width: `${row.exam}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Attendance {row.attendance}% · Homework {row.homework}%</p>
            <p className="text-sm">Support: {row.support}</p>
          </div>
        ))}
      </div>
      <label className="flex max-w-xl flex-col gap-1.5 text-sm">
        <span className="font-medium">Report-card remark draft</span>
        <textarea className="min-h-24 rounded-lg border border-input bg-card px-3 py-2" value={remark} onChange={(event) => setRemark(event.target.value)} placeholder="Write a remark the class teacher could use." />
      </label>
      <p className="text-xs text-muted-foreground">Class-teacher remarks cannot be saved until that role exists. This text stays on the page.</p>
    </PageContainer>
  );
}
