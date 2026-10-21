import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ className, label, error, hint, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <label className="flex w-full flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-foreground">{label}</span> : null}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={cn(
          "h-11 w-full rounded-lg border border-input bg-card px-3 text-foreground placeholder:text-muted-foreground",
          error && "border-danger",
          className,
        )}
        {...props}
      />
      {error ? (
        <span id={`${inputId}-error`} className="text-xs text-danger">
          {error}
        </span>
      ) : null}
      {!error && hint ? (
        <span id={`${inputId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
