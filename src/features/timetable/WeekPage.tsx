"use client";

import { useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { TeacherIdentity } from "@/components/teacher/TeacherIdentity";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { SIGNED_IN_TEACHER } from "@/config/teacher";
import { EMPTY_TIMETABLE_FILTER, filterPeriods, type TimetableFilter, type TimetableMode } from "@/features/timetable/filters";
import { mondayOf, toDateKey } from "@/lib/dates";
import { ASSIGNMENTS, PERIOD_TIMES, periodsInRange } from "@/mocks/fixture";
import type { PeriodSlot } from "@/types/domain";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function subjectLabel(subject: string | undefined) {
  return subject?.trim() ? subject : "Subject not listed";
}

function PeriodDetails({ period }: { period: PeriodSlot }) {
  return (
    <span className="block rounded-lg bg-muted px-2 py-2 text-left">
      <span className="block text-sm font-semibold">{subjectLabel(period.subject)}</span>
      <span className="block text-xs">
        Class {period.gradeLabel.replace("Grade ", "")} · Section {period.section}
      </span>
      <span className="block text-xs text-muted-foreground">
        {period.start}–{period.end} · Room {period.room}
      </span>
      <TeacherIdentity teacher={SIGNED_IN_TEACHER} variant="compact" className="mt-1" />
    </span>
  );
}

export function WeekPage() {
  const monday = mondayOf(new Date());
  const weekStart = toDateKey(monday);
  const weekEnd = toDateKey(addDays(monday, 4));
  const [draft, setDraft] = useState<TimetableFilter>({ ...EMPTY_TIMETABLE_FILTER, date: weekStart, rangeStart: weekStart, rangeEnd: weekEnd });
  const [applied, setApplied] = useState<TimetableFilter>(EMPTY_TIMETABLE_FILTER);

  const sourceStart = applied.mode === "range" && applied.rangeStart ? applied.rangeStart : applied.mode === "date" || applied.mode === "datetime" ? applied.date || weekStart : weekStart;
  const sourceEnd = applied.mode === "range" && applied.rangeEnd ? applied.rangeEnd : applied.mode === "date" || applied.mode === "datetime" ? applied.date || weekEnd : weekEnd;
  const rangeStartDate = parseISO(sourceStart);
  const rangeEndDate = parseISO(sourceEnd);
  const periods = Number.isNaN(rangeStartDate.getTime()) || Number.isNaN(rangeEndDate.getTime())
    ? []
    : filterPeriods(periodsInRange(rangeStartDate, rangeEndDate), applied);

  const grades = [...new Set(ASSIGNMENTS.map((item) => item.gradeLabel.replace("Grade ", "")))];
  const sectionOptions = ASSIGNMENTS.filter((item) => draft.grade === "all" || item.gradeLabel.replace("Grade ", "") === draft.grade).map((item) => item.section);
  const subjects = [...new Set(
    ASSIGNMENTS.filter((item) => {
      const grade = item.gradeLabel.replace("Grade ", "");
      return (draft.grade === "all" || grade === draft.grade) && (draft.section === "all" || item.section === draft.section);
    }).map((item) => item.subject),
  )];

  function patch(partial: Partial<TimetableFilter>) {
    setDraft((current) => {
      const next = { ...current, ...partial };
      if (partial.grade && partial.grade !== "all") {
        const allowed = ASSIGNMENTS.filter((item) => item.gradeLabel.replace("Grade ", "") === next.grade).map((item) => item.section);
        if (next.section !== "all" && !allowed.includes(next.section)) next.section = "all";
      }
      if (partial.grade || partial.section) {
        const allowedSubjects = ASSIGNMENTS.filter((item) => {
          const grade = item.gradeLabel.replace("Grade ", "");
          return (next.grade === "all" || grade === next.grade) && (next.section === "all" || item.section === next.section);
        }).map((item) => item.subject);
        if (next.subject !== "all" && !allowedSubjects.includes(next.subject)) next.subject = "all";
      }
      return next;
    });
  }

  const showGrid = applied.mode === "none" || applied.mode === "time";

  return (
    <PageContainer
      title="Timetable"
      description="Your published week. Changes are made by the school. This grid is a design fixture."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Dropdown label="Class" value={draft.grade} onChange={(grade) => patch({ grade })} options={[{ value: "all", label: "All classes" }, ...grades.map((grade) => ({ value: grade, label: `Class ${grade}` }))]} />
        <Dropdown label="Section" value={draft.section} onChange={(section) => patch({ section })} options={[{ value: "all", label: "All sections" }, ...[...new Set(sectionOptions)].map((section) => ({ value: section, label: `Section ${section}` }))]} />
        <Dropdown label="Subject" value={draft.subject} onChange={(subject) => patch({ subject })} options={[{ value: "all", label: "All subjects" }, ...subjects.map((subject) => ({ value: subject, label: subject }))]} />
        <Dropdown
          label="When"
          value={draft.mode}
          onChange={(mode) => patch({ mode: mode as TimetableMode })}
          options={[
            { value: "none", label: "This week" },
            { value: "date", label: "Custom date" },
            { value: "time", label: "Custom time" },
            { value: "datetime", label: "Custom date and time" },
            { value: "range", label: "Date range" },
          ]}
        />
        {draft.mode === "date" || draft.mode === "datetime" ? (
          <label className="block text-sm font-medium">
            Date
            <input type="date" value={draft.date} onChange={(event) => patch({ date: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-card px-3" />
          </label>
        ) : null}
        {draft.mode === "time" || draft.mode === "datetime" ? (
          <>
            <label className="block text-sm font-medium">
              From
              <input type="time" value={draft.timeStart} onChange={(event) => patch({ timeStart: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-card px-3" />
            </label>
            <label className="block text-sm font-medium">
              To
              <input type="time" value={draft.timeEnd} onChange={(event) => patch({ timeEnd: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-card px-3" />
            </label>
          </>
        ) : null}
        {draft.mode === "range" ? (
          <>
            <label className="block text-sm font-medium">
              Start date
              <input type="date" value={draft.rangeStart} onChange={(event) => patch({ rangeStart: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-card px-3" />
            </label>
            <label className="block text-sm font-medium">
              End date
              <input type="date" value={draft.rangeEnd} onChange={(event) => patch({ rangeEnd: event.target.value })} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-card px-3" />
            </label>
          </>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setApplied(draft)}>Apply filters</Button>
        <Button variant="outline" onClick={() => { setDraft({ ...EMPTY_TIMETABLE_FILTER, date: weekStart, rangeStart: weekStart, rangeEnd: weekEnd }); setApplied(EMPTY_TIMETABLE_FILTER); }}>
          Clear filters
        </Button>
      </div>
      {showGrid ? (
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[56rem] border-collapse text-sm">
            <caption className="sr-only">Weekly timetable</caption>
            <thead>
              <tr>
                <th className="p-2 text-left font-medium text-muted-foreground">Period</th>
                {DAYS.map((day, index) => (
                  <th key={day} className="p-2 text-left font-medium">
                    {day}
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      {format(parseISO(toDateKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index))), "d MMM")}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIOD_TIMES.map((slot) => (
                <tr key={slot.period} className="border-t border-border">
                  <th className="p-2 text-left font-medium">
                    P{slot.period}
                    <span className="block text-xs font-normal text-muted-foreground">{slot.start}–{slot.end}</span>
                  </th>
                  {DAYS.map((_, index) => {
                    const date = toDateKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index));
                    const cell = periods.find((period) => period.date === date && period.period === slot.period);
                    return <td key={date} className="p-2 align-top">{cell ? <PeriodDetails period={cell} /> : <span className="text-muted-foreground">—</span>}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className={showGrid ? "space-y-3 lg:hidden" : "space-y-3"}>
        {(showGrid ? DAYS.map((day, index) => ({ day, date: toDateKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index)) })) : [...new Set(periods.map((period) => period.date))].map((date) => ({ day: format(parseISO(date), "EEE d MMM"), date }))).map(({ day, date }) => {
          const rows = periods.filter((period) => period.date === date);
          if (!showGrid && rows.length === 0) return null;
          return (
            <Card key={date}>
              <CardContent className="space-y-2">
                <h2 className="font-semibold">{day}</h2>
                {rows.length === 0 ? <p className="text-sm text-muted-foreground">No periods</p> : rows.map((period) => <PeriodDetails key={period.id} period={period} />)}
              </CardContent>
            </Card>
          );
        })}
        {periods.length === 0 ? <p className="text-sm text-muted-foreground">No periods match these filters.</p> : null}
      </div>
    </PageContainer>
  );
}
