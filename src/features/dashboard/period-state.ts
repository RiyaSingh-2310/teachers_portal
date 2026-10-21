import { clockToMinutes, minutesOfDay } from "@/lib/dates";
import type { PeriodSlot } from "@/types/domain";

export type PeriodState = "done" | "now" | "upcoming";

export function periodState(period: PeriodSlot, now: Date): PeriodState {
  const current = minutesOfDay(now);
  const start = clockToMinutes(period.start);
  const end = clockToMinutes(period.end);
  if (current >= end) return "done";
  if (current >= start) return "now";
  return "upcoming";
}
