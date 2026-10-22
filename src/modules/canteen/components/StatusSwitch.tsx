"use client";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function StatusSwitch({
  active,
  label,
  onChange,
}: {
  active: boolean;
  label: string;
  onChange: (active: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={`${label}, ${active ? "active" : "inactive"}`}
      onClick={() => onChange(!active)}
      className="inline-flex min-h-10 items-center gap-2 rounded-lg"
    >
      <span className={cn("relative h-5 w-9 shrink-0 rounded-full", active ? "bg-success" : "bg-muted-foreground/35")}>
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm", active ? "left-4" : "left-0.5")} />
      </span>
      <Badge variant={active ? "success" : "default"}>{active ? "Active" : "Inactive"}</Badge>
    </button>
  );
}
