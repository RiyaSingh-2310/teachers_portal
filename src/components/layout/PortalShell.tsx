"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthProvider";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { getPortalRepository } from "@/repositories";
import type { ReactNode } from "react";

export function PortalShell({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !session) {
      const next = encodeURIComponent(pathname || "/app");
      router.replace(`/login?next=${next}`);
    }
  }, [loading, session, router, pathname]);

  const unreadQuery = useQuery({
    queryKey: ["messages", "unread-count"],
    queryFn: () => getPortalRepository().listMessages({ category: "unread", page: 1, limit: 1 }),
    enabled: Boolean(session),
  });

  if (loading || !session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Sidebar unread={unreadQuery.data?.total ?? 0} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        {/* <DemoBanner /> */}
        <main id="main" className="flex-1 overflow-x-hidden px-4 py-6 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function GuestShell({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) router.replace("/app");
  }, [loading, session, router]);

  if (loading || session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
