"use client";

import Link from "next/link";
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { MockCaption } from "@/components/ui/MockCaption";
import { SYLLABUS } from "@/mocks/catalog";

export function CurriculumPage() {
  const [done, setDone] = useState<Record<string, number>>({});
  return (
    <PageContainer
      title="Subjects and curriculum"
      description="Mathematics across your assigned classes. Topic completion is a browser sample."
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Curriculum" }]}
      actions={<Link href="/app/curriculum/lessons" className="text-sm font-medium text-brand">Lesson plans</Link>}
    >
      <MockCaption>Chapters are design fixtures. The school has no syllabus table for this portal yet.</MockCaption>
      <div className="grid gap-3 md:grid-cols-2">
        {SYLLABUS.map((chapter) => {
          const complete = done[chapter.id] ?? chapter.done;
          const percent = Math.round((complete / chapter.topics) * 100);
          return (
            <Card key={chapter.id}>
              <CardContent className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold">{chapter.chapter}</h2>
                  <span className="text-sm text-muted-foreground">{percent}%</span>
                </div>
                <p className="text-sm text-muted-foreground">{chapter.objective}</p>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-brand" style={{ width: `${percent}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{complete} of {chapter.topics} topics marked done in this browser.</p>
                <button
                  type="button"
                  className="text-sm font-medium text-brand"
                  onClick={() => setDone((current) => ({ ...current, [chapter.id]: Math.min(chapter.topics, complete + 1) }))}
                >
                  Mark one topic done
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
