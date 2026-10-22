import { clockToMinutes } from "@/lib/dates";
import type { PeriodSlot } from "@/types/domain";

export type TimetableMode = "none" | "date" | "time" | "datetime" | "range";

export interface TimetableFilter {
  grade: string;
  section: string;
  subject: string;
  mode: TimetableMode;
  date: string;
  timeStart: string;
  timeEnd: string;
  rangeStart: string;
  rangeEnd: string;
}

export const EMPTY_TIMETABLE_FILTER: TimetableFilter = {
  grade: "all",
  section: "all",
  subject: "all",
  mode: "none",
  date: "",
  timeStart: "",
  timeEnd: "",
  rangeStart: "",
  rangeEnd: "",
};

function containsClock(period: PeriodSlot, clock: string) {
  const minute = clockToMinutes(clock);
  return minute >= clockToMinutes(period.start) && minute <= clockToMinutes(period.end);
}

function overlapsWindow(period: PeriodSlot, start: string, end: string) {
  const from = clockToMinutes(start);
  const to = clockToMinutes(end);
  return clockToMinutes(period.start) <= to && clockToMinutes(period.end) >= from;
}

export function filterPeriods(periods: PeriodSlot[], filter: TimetableFilter) {
  return periods.filter((period) => {
    const grade = period.gradeLabel.replace("Grade ", "");
    if (filter.grade !== "all" && grade !== filter.grade) return false;
    if (filter.section !== "all" && period.section !== filter.section) return false;
    if (filter.subject !== "all" && period.subject !== filter.subject) return false;
    if ((filter.mode === "date" || filter.mode === "datetime") && filter.date && period.date !== filter.date) return false;
    if (filter.mode === "range" && filter.rangeStart && filter.rangeEnd) {
      if (period.date < filter.rangeStart || period.date > filter.rangeEnd) return false;
    }
    if (filter.mode === "time" || filter.mode === "datetime") {
      if (filter.timeStart && filter.timeEnd) {
        if (!overlapsWindow(period, filter.timeStart, filter.timeEnd)) return false;
      } else if (filter.timeStart && !containsClock(period, filter.timeStart)) return false;
    }
    return true;
  });
}
