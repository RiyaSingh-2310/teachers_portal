import {
  addDays,
  format,
  isSameDay,
  isWeekend,
  parseISO,
  startOfWeek,
} from "date-fns";

export function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatTimeLabel(iso: string) {
  const date = parseISO(iso);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelative(iso: string, now = new Date()) {
  const date = parseISO(iso);
  const minutes = Math.round((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  if (isSameDay(addDays(now, -1), date)) return "Yesterday";
  return format(date, "EEEE");
}

export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function parseDateKey(value: string) {
  return parseISO(value);
}

export function mondayOf(date: Date) {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function teachingDays(from: Date, count: number) {
  const days: Date[] = [];
  let cursor = from;
  while (days.length < count) {
    if (!isWeekend(cursor)) days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

export function clockToMinutes(clock: string) {
  const [hour, minute] = clock.split(":").map(Number);
  return hour * 60 + minute;
}
