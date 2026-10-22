"use client";

import Link from "next/link";
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { HOLIDAYS } from "@/mocks/fixture";
import { EVENTS } from "@/mocks/catalog";
import { Tabs } from "@/components/ui/Tabs";
import { toDateKey } from "@/lib/dates";

export function CalendarPage() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [view, setView] = useState("month");
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  return (
    <PageContainer title="Calendar" description="School dates you can see. You cannot edit a school-wide event." crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Calendar" }]}>
      <Tabs value={view} onChange={setView} options={[{ id: "month", label: "Month" }, { id: "agenda", label: "Agenda" }]} />
      {view === "agenda" ? (
        <ul className="space-y-2">
          {EVENTS.map((event) => (
            <li key={event.date + event.label} className="rounded-xl border border-border bg-card px-3 py-3 text-sm">
              <span className="font-medium">{event.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{event.date} · {event.kind}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {view === "month" ? (
      <>
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setCursor(addMonths(cursor, -1))}>
          Previous
        </Button>
        <h2 className="text-base font-semibold">{format(cursor, "MMMM yyyy")}</h2>
        <Button variant="outline" onClick={() => setCursor(addMonths(cursor, 1))}>
          Next
        </Button>
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
              className={`min-h-16 rounded-lg border border-border p-2 text-left text-sm ${inMonth ? "bg-card" : "opacity-40"}`}
            >
              <span className="font-medium">{format(day, "d")}</span>
              {holiday ? <span className="mt-1 block text-[11px] text-info">{holiday}</span> : null}
            </Link>
          );
        })}
      </div>
      </>
      ) : null}
    </PageContainer>
  );
}
