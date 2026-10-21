import { Suspense } from "react";
import { PortalShell } from "@/components/layout/PortalShell";

export const instant = false;

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      }
    >
      <PortalShell>{children}</PortalShell>
    </Suspense>
  );
}
