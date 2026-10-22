import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export interface TeacherInfo {
  name: string;
  designation?: string;
  department?: string;
  employeeId?: string;
  photoUrl?: string | null;
}

export function TeacherIdentity({
  teacher,
  variant = "row",
  className,
}: {
  teacher: TeacherInfo;
  variant?: "compact" | "card" | "row";
  className?: string;
}) {
  const meta = [teacher.designation, teacher.department, teacher.employeeId ? `ID ${teacher.employeeId}` : null]
    .filter(Boolean)
    .join(" · ");

  if (variant === "compact") {
    return (
      <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
        <Avatar name={teacher.name} src={teacher.photoUrl} className="h-6 w-6 text-[10px]" />
        <span className="truncate text-xs font-medium">{teacher.name}</span>
      </span>
    );
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-3", variant === "card" && "rounded-xl border border-border bg-card p-3", className)}>
      <Avatar name={teacher.name} src={teacher.photoUrl} className={variant === "card" ? "h-12 w-12 text-sm" : undefined} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{teacher.name}</p>
        {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
      </div>
    </div>
  );
}
