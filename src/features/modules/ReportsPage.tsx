"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { MockCaption } from "@/components/ui/MockCaption";
import { PERFORMANCE } from "@/mocks/catalog";

export function ReportsPage() {
  const [klass, setKlass] = useState("Grade 8 A");
  const rows = PERFORMANCE;

  function download() {
    const header = "Student,Attendance,Homework,Exam";
    const body = rows.map((row) => `${row.name},${row.attendance},${row.homework},${row.exam}`).join("\n");
    const blob = new Blob([`${header}\n${body}\n`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample-class-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded a CSV of the sample rows in this browser. It is not a school report.");
  }

  return (
    <PageContainer
      title="Reports"
      description="Sample summaries for classes you teach."
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Reports" }]}
      actions={<Button variant="outline" onClick={download}>Download sample CSV</Button>}
    >
      <MockCaption>PDF and Excel export from the school is not available. Print uses this page.</MockCaption>
      <label className="flex max-w-xs flex-col gap-1.5 text-sm">
        <span className="font-medium">Class</span>
        <select className="h-11 rounded-lg border border-input bg-card px-3" value={klass} onChange={(event) => setKlass(event.target.value)}>
          <option>Grade 8 A</option>
          <option>Grade 8 B</option>
          <option>Grade 7 B</option>
        </select>
      </label>
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-sm">
          <caption className="mb-2 text-left text-sm font-medium">{klass} mathematics · sample</caption>
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2">Student</th>
              <th>Attendance</th>
              <th>Homework</th>
              <th>Exam</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-border">
                <td className="py-2">{row.name}</td>
                <td>{row.attendance}%</td>
                <td>{row.homework}%</td>
                <td>{row.exam}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="outline" onClick={() => window.print()}>Print this view</Button>
    </PageContainer>
  );
}
