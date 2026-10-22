"use client";

import { useSyncExternalStore } from "react";
import { LEAVE_TYPES } from "@/mocks/catalog";

export type LeaveStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";

export interface LeaveApplication {
  id: string;
  reference: string;
  typeId: string;
  typeName: string;
  halfDay: boolean;
  start: string;
  end: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  decisionOn: string | null;
  remarks: string;
  fileName: string | null;
}

const seed: LeaveApplication[] = [
  {
    id: "lv-1042",
    reference: "LV-1042",
    typeId: "casual",
    typeName: "Casual leave",
    halfDay: false,
    start: "2026-11-16",
    end: "2026-11-17",
    days: 2,
    reason: "Family function. Sample application, not filed with the school.",
    status: "PENDING",
    appliedOn: "2026-10-18",
    decisionOn: null,
    remarks: "",
    fileName: null,
  },
  {
    id: "lv-0988",
    reference: "LV-0988",
    typeId: "sick",
    typeName: "Sick leave",
    halfDay: false,
    start: "2026-09-04",
    end: "2026-09-04",
    days: 1,
    reason: "Fever. Sample history row.",
    status: "APPROVED",
    appliedOn: "2026-09-03",
    decisionOn: "2026-09-03",
    remarks: "Approved in this demonstration. Not a school decision.",
    fileName: "note.pdf",
  },
  {
    id: "lv-0901",
    reference: "LV-0901",
    typeId: "earned",
    typeName: "Earned leave",
    halfDay: true,
    start: "2026-08-12",
    end: "2026-08-12",
    days: 0.5,
    reason: "Appointment.",
    status: "REJECTED",
    appliedOn: "2026-08-01",
    decisionOn: "2026-08-02",
    remarks: "Sample rejection: dates clash with an exam duty.",
    fileName: null,
  },
];

let applications = seed.map((item) => ({ ...item }));
const listeners = new Set<() => void>();

function emit() {
  applications = applications.map((item) => ({ ...item }));
  listeners.forEach((listener) => listener());
}

export function leaveSnapshot() {
  return applications;
}

export function useLeaveApplications() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    leaveSnapshot,
    leaveSnapshot,
  );
}

export function leaveDays(start: string, end: string, halfDay: boolean) {
  const from = new Date(`${start}T00:00:00`);
  const to = new Date(`${end}T00:00:00`);
  const diff = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
  if (Number.isNaN(diff) || diff < 1) return 0;
  if (halfDay && diff === 1) return 0.5;
  return diff;
}

export function overlaps(start: string, end: string, ignoreId?: string) {
  return applications.some((item) => {
    if (item.id === ignoreId) return false;
    if (item.status === "WITHDRAWN" || item.status === "REJECTED" || item.status === "DRAFT") return false;
    return start <= item.end && end >= item.start;
  });
}

export function saveLeave(input: Omit<LeaveApplication, "id" | "reference" | "appliedOn" | "decisionOn" | "remarks">) {
  const next: LeaveApplication = {
    ...input,
    id: `lv-${Date.now()}`,
    reference: `LV-${String(Date.now()).slice(-4)}`,
    appliedOn: new Date().toISOString().slice(0, 10),
    decisionOn: null,
    remarks: "",
  };
  applications = [next, ...applications];
  emit();
  return next;
}

export function withdrawLeave(id: string) {
  const item = applications.find((row) => row.id === id);
  if (!item || (item.status !== "PENDING" && item.status !== "DRAFT")) return false;
  item.status = "WITHDRAWN";
  emit();
  return true;
}

export function leaveTypeName(id: string) {
  return LEAVE_TYPES.find((type) => type.id === id)?.name ?? id;
}
