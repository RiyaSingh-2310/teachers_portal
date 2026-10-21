import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export function SuspendedPage({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      {children}
    </Suspense>
  );
}
