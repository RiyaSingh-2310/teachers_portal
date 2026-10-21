"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  FIXTURE_EMAIL,
  FIXTURE_PASSWORD,
  getPortalPhase,
  isApiMode,
} from "@/config/app";
import { PortalError } from "@/lib/api/errors";
import type { DemoSession } from "@/types/domain";

const STORAGE_KEY = "spdf.teacher.demo-session";

interface AuthContextValue {
  session: DemoSession | null;
  loading: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const listeners = new Set<() => void>();
let session: DemoSession | null = null;
let hydrated = false;

function readStored(): DemoSession | null {
  const raw =
    window.localStorage.getItem(STORAGE_KEY) ??
    window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DemoSession;
    if (parsed.kind !== "ui-demonstration" || parsed.role !== "TEACHER") return null;
    return parsed;
  } catch {
    return null;
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  session = readStored();
  hydrated = true;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snapshot() {
  hydrate();
  return session;
}

function clearStored() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const current = useSyncExternalStore(subscribe, snapshot, () => null);
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session: current,
      loading: !ready,
      async signIn(email, password, remember) {
        if (isApiMode()) {
          throw new PortalError(
            "API_NOT_READY",
            "Teacher sign-in is not connected to the school server yet.",
          );
        }
        const normalized = email.trim().toLowerCase();
        if (normalized === "admin@spdf.school" || normalized === "parent@spdf.school") {
          throw new PortalError(
            "NOT_A_TEACHER",
            "This sign-in is for teachers. Use the portal your school gave you.",
          );
        }
        if (normalized !== FIXTURE_EMAIL || password !== FIXTURE_PASSWORD) {
          throw new PortalError("INVALID_CREDENTIALS", "Email or password is incorrect.");
        }
        const next: DemoSession = {
          kind: "ui-demonstration",
          staffId: "staff-meera",
          schoolId: "school-spdf",
          email: FIXTURE_EMAIL,
          displayName: "Meera Iyer",
          firstName: "Meera",
          role: "TEACHER",
          phase: getPortalPhase(),
        };
        clearStored();
        const store = remember ? window.localStorage : window.sessionStorage;
        store.setItem(STORAGE_KEY, JSON.stringify(next));
        session = next;
        emit();
      },
      signOut() {
        clearStored();
        session = null;
        emit();
      },
    }),
    [current, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
