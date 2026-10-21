import { Inbox, Lock } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        {description ? (
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again. If the problem continues, contact your school administrator.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        ) : null
      }
    />
  );
}

export function PermissionState() {
  return (
    <EmptyState
      icon={<Lock className="h-5 w-5" />}
      title="You don’t have access to this page"
      description="It may belong to another class, or your school has not opened it."
      action={
        <Link
          href="/app"
          className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium"
        >
          Back to home
        </Link>
      }
    />
  );
}
