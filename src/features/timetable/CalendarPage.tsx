"use client";

import Link from "next/link";
import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from "date-fns";
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { HOLIDAYS } from "@/mocks/fixture";
import { EVENTS } from "@/mocks/catalog";
import { Tabs } from "@/components/ui/Tabs";
import { toDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

const HOLIDAY_CELL = "border-danger bg-danger-muted text-danger";

const KIND_STYLE: Record<string, string> = {
  Holiday: HOLIDAY_CELL,
  Exam: "border-warning/40 bg-warning-muted",
  Meeting: "border-brand/30 bg-brand-muted",
  Event: "border-accent/30 bg-accent/10",
  Deadline: "border-border bg-muted",
};

export function CalendarPage() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [view, setView] = useState("month");
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
  const agenda = [
    ...EVENTS,
    ...Object.entries(HOLIDAYS)
      .filter(([date]) => !EVENTS.some((event) => event.date === date && event.kind === "Holiday"))
      .map(([date, label]) => ({ date, label, kind: "Holiday" })),
  ].sort((left, right) => left.date.localeCompare(right.date) || left.label.localeCompare(right.label));

  return (
    <PageContainer title="Calendar" description="School dates you can see. You cannot edit a school-wide event." crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Calendar" }]}>
      <Tabs value={view} onChange={setView} options={[{ id: "month", label: "Month" }, { id: "week", label: "Week" }, { id: "agenda", label: "Agenda" }]} />
      <ul className="flex flex-wrap gap-2 text-xs" aria-label="Calendar legend">
        <li className={cn("rounded-full border px-2 py-1", HOLIDAY_CELL)}>Holiday</li>
        <li className="rounded-full border border-warning/40 bg-warning-muted px-2 py-1">Examination</li>
        <li className="rounded-full border border-brand/30 bg-brand-muted px-2 py-1">Meeting</li>
        <li className="rounded-full border border-accent/30 bg-accent/10 px-2 py-1">School event</li>
        <li className="rounded-full border border-border bg-muted px-2 py-1">Leave or deadline</li>
      </ul>
      {view === "agenda" ? (
        <ul className="space-y-2">
          {agenda.map((event) => (
            <li key={event.date + event.label} className={cn("rounded-xl border px-3 py-3 text-sm", KIND_STYLE[event.kind] ?? "border-border bg-card")}>
              <span className="font-medium">{event.label}</span>
              <span className="mt-1 block text-xs">{event.date} · {event.kind}{HOLIDAYS[event.date] ? ` · Holiday: ${HOLIDAYS[event.date]}` : ""}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {view === "week" ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
          {weekDays.map((day) => {
            const key = toDateKey(day);
            const holiday = HOLIDAYS[key];
            const events = EVENTS.filter((event) => event.date === key);
            return (
              <Link key={key} href={`/app/day?date=${key}`} className={cn("min-h-28 rounded-xl border p-3 text-sm", holiday ? HOLIDAY_CELL : "border-border bg-card")}>
                <span className="font-semibold">{format(day, "EEE d MMM")}</span>
                {holiday ? <span className="mt-2 block text-xs font-semibold text-danger">Holiday · {holiday}</span> : null}
                {events.filter((event) => event.kind !== "Holiday").map((event) => (
                  <span key={event.label} className="mt-2 block text-xs">{event.kind} · {event.label}</span>
                ))}
              </Link>
            );
          })}
        </div>
      ) : null}
      {view === "month" ? (
      <>
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" onClick={() => setCursor(addMonths(cursor, -1))}>Previous</Button>
        <h2 className="text-base font-semibold">{format(cursor, "MMMM yyyy")}</h2>
        <Button variant="outline" onClick={() => setCursor(addMonths(cursor, 1))}>Next</Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
          <div key={label} className="py-2">{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = toDateKey(day);
          const holiday = HOLIDAYS[key];
          const inMonth = day.getMonth() === cursor.getMonth();
          return (
            <Link
              key={key}
              href={`/app/day?date=${key}`}
              aria-label={holiday ? `${format(day, "d MMMM yyyy")}, holiday, ${holiday}` : format(day, "d MMMM yyyy")}
              className={cn("min-h-16 rounded-lg border p-2 text-left text-sm", holiday ? HOLIDAY_CELL : "border-border bg-card", !inMonth && "opacity-40")}
            >
              <span className={cn("font-medium", holiday && "text-danger")}>{format(day, "d")}</span>
              {holiday ? <span className="mt-1 block text-[11px] font-semibold leading-snug text-danger">Holiday · {holiday}</span> : null}
            </Link>
          );
        })}
      </div>
      </>
      ) : null}
    </PageContainer>
  );
}
