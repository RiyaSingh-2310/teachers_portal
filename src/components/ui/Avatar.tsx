import { cn } from "@/lib/utils";

export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={cn("h-9 w-9 rounded-full object-cover ring-1 ring-border", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-brand-muted text-xs font-semibold text-brand ring-1 ring-border",
        className,
      )}
      aria-hidden
    >
      {initials || "?"}
    </div>
  );
}
