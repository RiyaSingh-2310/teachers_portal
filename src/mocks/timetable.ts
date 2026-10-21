import { format, isWeekend } from "date-fns";
import { ASSIGNMENTS } from "@/mocks/assignments";
import { HOLIDAYS } from "@/mocks/notices";

export function isTeachingDay(date: Date) {
  return !isWeekend(date);
}

export function weekdayIndex(date: Date) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

type Cell = { assignmentId: string; room: string } | null;

const WEEK: Record<number, Record<number, Cell>> = {
  1: {
    1: { assignmentId: "8a-math", room: "12" },
    2: { assignmentId: "8b-math", room: "12" },
    3: { assignmentId: "7b-math", room: "14" },
    6: null,
  },
  2: {
    1: { assignmentId: "7b-math", room: "14" },
    2: { assignmentId: "8a-math", room: "12" },
    3: null,
    6: { assignmentId: "6a-math", room: "11" },
  },
  3: {
    1: { assignmentId: "8a-math", room: "12" },
    2: { assignmentId: "8a-math", room: "12" },
    3: { assignmentId: "7b-math", room: "14" },
    6: { assignmentId: "8b-math", room: "12" },
  },
  4: {
    1: { assignmentId: "6a-math", room: "11" },
    2: { assignmentId: "8a-math", room: "12" },
    3: { assignmentId: "8b-math", room: "12" },
    6: null,
  },
  5: {
    1: { assignmentId: "8b-math", room: "12" },
    2: { assignmentId: "7b-math", room: "14" },
    3: null,
    6: { assignmentId: "8a-math", room: "12" },
  },
};

export const PERIOD_TIMES = [
  { period: 1, start: "08:30", end: "09:15" },
  { period: 2, start: "09:20", end: "10:05" },
  { period: 3, start: "10:20", end: "11:05" },
  { period: 6, start: "13:10", end: "13:55" },
];

export function periodsForDate(date: Date) {
  const key = format(date, "yyyy-MM-dd");
  if (HOLIDAYS[key] || isWeekend(date)) return [];
  const day = weekdayIndex(date);
  const row = WEEK[day] ?? {};
  return PERIOD_TIMES.flatMap((slot) => {
    const cell = row[slot.period];
    if (!cell) return [];
    const assignment = ASSIGNMENTS.find((item) => item.id === cell.assignmentId);
    if (!assignment) return [];
    return [
      {
        id: `${key}-p${slot.period}`,
        date: key,
        weekday: format(date, "EEEE"),
        period: slot.period,
        start: slot.start,
        end: slot.end,
        assignmentId: assignment.id,
        gradeLabel: assignment.gradeLabel,
        section: assignment.section,
        subject: assignment.subject,
        room: cell.room,
      },
    ];
  });
}
