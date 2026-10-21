"use client";

import { PermissionState } from "@/components/ui/EmptyState";
import { getPortalPhase } from "@/config/app";

export function PhaseLockedPage({ minPhase }: { minPhase: 2 | 3 }) {
  if (getPortalPhase() < minPhase) return <PermissionState />;
  return (
    <PermissionState />
  );
}
