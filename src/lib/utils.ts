import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTimeOfDayGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function wait(ms = 280) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    page: safePage,
    limit,
    total,
    totalPages,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  };
}
