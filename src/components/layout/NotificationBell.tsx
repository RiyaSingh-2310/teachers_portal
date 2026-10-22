"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { markNoticeRead, unreadNoticeCount, useNotices } from "@/features/notifications/store";

export function NotificationBell() {
  const notices = useNotices();
  const unread = unreadNoticeCount(notices);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] text-white">
            {unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-80 max-w-[80vw] rounded-xl border border-border bg-popover p-2 shadow-md">
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-sm font-semibold">Notifications</p>
            <Link href="/app/notifications" className="text-xs font-medium text-brand" onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {notices.slice(0, 4).map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-2 py-2 hover:bg-muted"
                  onClick={() => {
                    markNoticeRead(item.id);
                    setOpen(false);
                  }}
                >
                  <span className="block text-sm font-medium">{item.title}</span>
                  <span className="block text-xs text-muted-foreground">{item.body}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
