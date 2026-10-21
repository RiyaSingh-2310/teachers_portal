"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { mondayOf, toDateKey } from "@/lib/dates";
import { PERIOD_TIMES } from "@/mocks/fixture";
import { getPortalRepository } from "@/repositories";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function WeekPage() {
  const monday = mondayOf(new Date());
  const key = toDateKey(monday);
  const query = useQuery({
    queryKey: ["week", key],
    queryFn: () => getPortalRepository().getWeek(key),
  });
  const periods = query.data ?? [];

  return (
    <PageContainer
      title="Timetable"
      description="Your published week. Changes are made by the school. This grid is a design fixture."
    >
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[48rem] border-collapse text-sm">
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
                  <span className="block text-xs font-normal text-muted-foreground">
                    {slot.start}
                  </span>
                </th>
                {DAYS.map((_, index) => {
                  const date = toDateKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index));
                  const cell = periods.find((period) => period.date === date && period.period === slot.period);
                  return (
                    <td key={date} className="p-2 align-top">
                      {cell ? (
                        <span className="block rounded-lg bg-muted px-2 py-2">
                          {cell.gradeLabel.replace("Grade ", "")}
                          {cell.section} {cell.subject.replace("Mathematics", "Maths")}
                          <span className="block text-xs text-muted-foreground">Room {cell.room}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 lg:hidden">
        {DAYS.map((day, index) => {
          const date = toDateKey(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index));
          const rows = periods.filter((period) => period.date === date);
          return (
            <Card key={day}>
              <CardContent>
                <h2 className="font-semibold">{day}</h2>
                {rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No periods</p>
                ) : (
                  rows.map((period) => (
                    <p key={period.id} className="mt-2 text-sm">
                      P{period.period} {period.start} · {period.gradeLabel} {period.section} · Room {period.room}
                    </p>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
