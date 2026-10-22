"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthProvider";
import { ErrorState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ACADEMIC_YEAR_LABEL } from "@/config/app";
import { CountCard } from "@/features/dashboard/CountCard";
import { QuickActions } from "@/features/dashboard/QuickActions";
import {
  AnnouncementsCard,
  AttendanceCard,
  ClassesCard,
  ExamsCard,
  TimetableCard,
} from "@/features/dashboard/DashboardWidgets";
import { NowCard } from "@/features/dashboard/NowCard";
import { periodState } from "@/features/dashboard/period-state";
import { getTimeOfDayGreeting } from "@/lib/utils";
import { getPortalRepository } from "@/repositories";

export function DashboardPage() {
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getPortalRepository().getDashboard(),
  });

  if (query.isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-4" aria-busy="true">
        <Skeleton className="h-16" />
        <Skeleton className="h-28" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        description="The demonstration home view could not be prepared."
        onRetry={() => void query.refetch()}
      />
    );
  }

  const data = query.data;
  const now = new Date();
  const states = data.periods.map((period) => ({ period, state: periodState(period, now) }));
  const current = states.find((item) => item.state === "now");
  const upcoming = states.find((item) => item.state === "upcoming");
  const focus = current ?? upcoming;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      <div className="space-y-0.5">
        <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
          {getTimeOfDayGreeting(now)}, {session?.firstName ?? "Meera"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Mathematics · {data.periods.length} classes today · Academic year {ACADEMIC_YEAR_LABEL}
        </p>
      </div>

      <NowCard focus={focus} finished={states.length > 0 && !focus} empty={states.length === 0} />
      <QuickActions />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CountCard label="Assigned classes" value={String(data.assignments.length)} href="/app/classes" tone="bg-brand-muted text-brand" />
        <CountCard label="Assigned subjects" value="1" href="/app/curriculum" tone="bg-accent/15 text-accent" />
        <CountCard label="Today’s classes" value={String(data.periods.length)} href="/app/day" tone="bg-info-muted text-info" />
        <CountCard label="Sample leave balance" value="21.5 days" href="/app/leave" tone="bg-warning-muted text-warning" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <CountCard label="Attendance" value="View only" href="/app/attendance" tone="bg-warning-muted text-warning" />
        <CountCard
          label="Homework to review"
          value={data.unreviewedSubmissions === 0 ? "Clear" : String(data.unreviewedSubmissions)}
          href="/app/homework?status=needs-review"
          tone="bg-brand-muted text-brand"
        />
        <CountCard
          label="Unread messages"
          value={data.unreadMessages === 0 ? "Clear" : String(data.unreadMessages)}
          href="/app/messages?category=unread"
          tone="bg-info-muted text-info"
        />
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,0.85fr)] lg:items-start lg:gap-5">
        <TimetableCard states={states} />
        <div className="flex min-w-0 flex-col gap-4">
          <ClassesCard assignments={data.assignments} />
          <AttendanceCard rows={data.attendance} />
          <AnnouncementsCard items={data.announcements} />
          <ExamsCard exams={data.exams} />
        </div>
      </div>
    </div>
  );
}
