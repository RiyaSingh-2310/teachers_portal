"use client";

import { useSyncExternalStore } from "react";
import { NOTIFICATIONS } from "@/mocks/catalog";

export interface NoticeItem {
  id: string;
  title: string;
  body: string;
  href: string;
  unread: boolean;
}

let items: NoticeItem[] = NOTIFICATIONS.map((item) => ({ ...item }));
const listeners = new Set<() => void>();

function emit() {
  items = items.map((item) => ({ ...item }));
  listeners.forEach((listener) => listener());
}

export function useNotices() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => items,
    () => items,
  );
}

export function unreadNoticeCount(list: NoticeItem[]) {
  return list.filter((item) => item.unread).length;
}

export function markNoticeRead(id: string) {
  const item = items.find((row) => row.id === id);
  if (!item) return;
  item.unread = false;
  emit();
}

export function markAllNoticesRead() {
  items.forEach((item) => {
    item.unread = false;
  });
  emit();
}
