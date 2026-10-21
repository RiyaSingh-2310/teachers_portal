import { isApiMode } from "@/config/app";
import { notReady } from "@/lib/api/errors";
import { mockPortalRepository } from "@/repositories/mock/portal-repository";
import type { PortalRepository } from "@/repositories/types";

function apiPortalRepository(): PortalRepository {
  return new Proxy({} as PortalRepository, {
    get() {
      return () => notReady("This teacher view");
    },
  });
}

export function getPortalRepository(): PortalRepository {
  if (isApiMode()) return apiPortalRepository();
  return mockPortalRepository;
}
