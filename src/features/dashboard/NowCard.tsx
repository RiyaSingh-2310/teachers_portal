import { CalendarOff, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import type { PeriodState } from "@/features/dashboard/period-state";
import type { PeriodSlot } from "@/types/domain";

interface Focus {
  period: PeriodSlot;
  state: PeriodState;
}

export function NowCard({
  focus,
  finished,
  empty,
}: {
  focus?: Focus;
  finished: boolean;
  empty: boolean;
}) {
  if (empty) {
    return (
      <Card className="border-info/30 bg-info-muted/40">
        <CardContent className="flex items-start gap-3 p-4 sm:p-5">
          <CalendarOff className="h-5 w-5 text-info" />
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Today · No periods</p>
            <h2 className="text-lg font-semibold">Your timetable has no teaching periods today.</h2>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!focus || finished) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Today · Finished</p>
              <h2 className="text-lg font-semibold">No further periods today.</h2>
            </div>
          </div>
          <Link href="/app/day" className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium">
            View my day
          </Link>
        </CardContent>
      </Card>
    );
  }

  const live = focus.state === "now";
  return (
    <Card className={live ? "border-accent/40 bg-accent/5" : undefined}>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <Clock3 className="h-5 w-5 text-accent" />
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {live ? `Now · Period ${focus.period.period}` : `Next · Period ${focus.period.period} · ${focus.period.start}`}
            </p>
            <h2 className="text-lg font-semibold">
              {focus.period.gradeLabel} · Section {focus.period.section} · {focus.period.subject}
            </h2>
            <p className="text-sm text-muted-foreground">Room {focus.period.room}</p>
          </div>
        </div>
        <Link
          href={`/app/classes/${focus.period.assignmentId}`}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium sm:w-auto"
        >
          Open class
        </Link>
      </CardContent>
    </Card>
  );
}
