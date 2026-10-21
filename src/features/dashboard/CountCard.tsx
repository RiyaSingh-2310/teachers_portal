import Link from "next/link";
import { cn } from "@/lib/utils";

export function CountCard({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: string;
  href: string;
  tone: string;
}) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <span className={cn("inline-flex rounded-lg px-2 py-1 text-xs font-medium", tone)}>{label}</span>
      <span className="mt-3 block text-xl font-semibold">{value}</span>
    </Link>
  );
}
