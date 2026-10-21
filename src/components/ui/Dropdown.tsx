"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

export function Dropdown<T extends string = string>({
  value,
  options,
  onChange,
  label,
  hideLabel = false,
  placeholder = "Select",
  className,
  align = "left",
}: {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  hideLabel?: boolean;
  placeholder?: string;
  className?: string;
  align?: "left" | "right";
  leading?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const listboxId = useId();
  const selected = options.find((option) => option.value === value) ?? null;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {label ? (
        <span id={labelId} className={cn("mb-1.5 block text-xs font-medium text-muted-foreground", hideLabel && "sr-only")}>
          {label}
        </span>
      ) : null}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={label ? labelId : undefined}
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full min-w-[9.5rem] items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-left hover:bg-muted"
      >
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground", open && "rotate-180")} />
      </button>
      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={label ? labelId : undefined}
          className={cn(
            "absolute z-40 mt-1.5 max-h-60 min-w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-md",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-muted",
                    isSelected && "bg-brand-muted text-brand",
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0 flex-1 truncate font-medium">{option.label}</span>
                  {isSelected ? <Check className="h-4 w-4" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
