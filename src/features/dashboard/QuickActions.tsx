import Link from "next/link";

const ACTIONS = [
  { href: "/app/attendance", label: "Take attendance" },
  { href: "/app/homework/new", label: "Add homework" },
  { href: "/app/exams/marks", label: "Enter marks" },
  { href: "/app/curriculum/lessons", label: "Create lesson plan" },
  { href: "/app/leave", label: "Apply for leave" },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
