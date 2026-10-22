"use client";

import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { MockCaption } from "@/components/ui/MockCaption";
import { markAllNoticesRead, markNoticeRead, useNotices } from "@/features/notifications/store";

export function NotificationsPage() {
  const notices = useNotices();
  return (
    <PageContainer
      title="Notifications"
      description="Reminders for your classes. Marking them read stays in this browser."
      crumbs={[{ label: "Dashboard", href: "/app" }, { label: "Notifications" }]}
      actions={<Button variant="outline" onClick={() => markAllNoticesRead()}>Mark all read</Button>}
    >
      <MockCaption>These reminders are fixtures. They are not school push notifications.</MockCaption>
      <ul className="space-y-2">
        {notices.map((item) => (
          <li key={item.id} className="rounded-xl border border-border bg-card px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </div>
              {item.unread ? <span className="mt-1 h-2 w-2 rounded-full bg-brand" /> : null}
            </div>
            <div className="mt-2 flex gap-3 text-sm">
              <Link href={item.href} className="font-medium text-brand">Open</Link>
              {item.unread ? (
                <button type="button" className="text-muted-foreground" onClick={() => markNoticeRead(item.id)}>
                  Mark read
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
