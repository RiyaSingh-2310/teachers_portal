export function MockCaption({ children }: { children: string }) {
  return (
    <p className="rounded-lg border border-warning/30 bg-warning-muted px-3 py-2 text-xs text-warning">
      {children}
    </p>
  );
}
