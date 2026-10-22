import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageContainer({
  title,
  description,
  actions,
  children,
  className,
  crumbs,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl space-y-6", className)}>
      {crumbs && crumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {crumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  href,
  meta,
}: {
  title: string;
  href?: string;
  meta?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-5">
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold">{title}</h2>
        {meta ? <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-brand hover:underline">
          View all
        </Link>
      ) : null}
    </div>
  );
}
