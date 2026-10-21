"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState, ErrorState, PermissionState } from "@/components/ui/EmptyState";
import { formatRelative } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { getPortalRepository } from "@/repositories";

const LIMIT = 12;

export function MessagesPage() {
  const params = useSearchParams();
  const router = useRouter();
  const category = params.get("category") ?? "unread";
  const page = Number(params.get("page") ?? "1");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const query = useQuery({
    queryKey: ["messages", category, search, page],
    queryFn: () =>
      getPortalRepository().listMessages({
        category: category as "all" | "unread" | "announcement" | "alert",
        search,
        page,
        limit: LIMIT,
      }),
  });

  function setCategory(next: string) {
    const queryString = new URLSearchParams();
    if (next !== "unread") queryString.set("category", next);
    router.push(`/app/messages${queryString.size ? `?${queryString}` : ""}`);
  }

  return (
    <PageContainer title="Messages" description="Announcements and alerts for you. This inbox is a design fixture.">
      <input
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Search messages"
        aria-label="Search messages"
        className="h-11 w-full max-w-xl rounded-lg border border-input bg-card px-3 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        {[
          ["unread", "Unread"],
          ["all", "All"],
          ["announcement", "Announcements"],
          ["alert", "Alerts"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            className={cn(
              "min-h-11 rounded-full border px-3 text-sm",
              category === value ? "border-brand bg-brand-muted text-brand" : "border-border",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {query.isError ? <ErrorState onRetry={() => void query.refetch()} /> : null}
      {query.data && query.data.total === 0 ? (
        <EmptyState title="No announcements" description="Nothing matches this filter." />
      ) : null}
      <div className="space-y-3">
        {query.data?.items.map((item) => (
          <Link key={item.id} href={`/app/messages/${item.id}`}>
            <Card>
              <CardContent>
                <div className="flex items-start gap-2">
                  {item.unread ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" /> : <span className="mt-1.5 h-2 w-2" />}
                  <div>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="text-xs text-muted-foreground">
                      {item.sender} · {formatRelative(item.sentAt)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {page > 1 ? <p className="text-sm text-muted-foreground">Page {page}</p> : null}
    </PageContainer>
  );
}

export function MessageDetailPage() {
  const params = useParams<{ messageId: string }>();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["message", params.messageId],
    queryFn: () => getPortalRepository().getMessage(params.messageId),
  });
  const mark = useMutation({
    mutationFn: () => getPortalRepository().markMessageRead(params.messageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["message", params.messageId] });
      await queryClient.invalidateQueries({ queryKey: ["messages"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Marked as read in this browser only.");
    },
  });

  if (query.isLoading) return <p className="text-sm text-muted-foreground">Loading message…</p>;
  if (!query.data) return <PermissionState />;
  const message = query.data;

  return (
    <PageContainer
      title={message.title}
      description={`${message.sender} · ${formatRelative(message.sentAt)}`}
      actions={
        <Link href="/app/messages" className="text-sm font-medium text-brand">
          Back to messages
        </Link>
      }
    >
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6">{message.body}</p>
          {message.unread ? (
            <Button variant="outline" disabled={mark.isPending} onClick={() => mark.mutate()}>
              Mark as read
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Read in this demonstration.</p>
          )}
          {message.href ? (
            <Link href={message.href} className="inline-flex text-sm font-medium text-brand">
              Open
            </Link>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
