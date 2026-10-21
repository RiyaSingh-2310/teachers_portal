import {
  BarChart3,
  BookMarked,
  BookOpen,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  FolderOpen,
  GraduationCap,
  Home,
  MessageSquare,
  NotebookPen,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { TeacherPermission } from "@/types/domain";

export interface TeacherNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  group: "teaching" | "school" | "account";
  minPhase: 1 | 2 | 3;
  permission: TeacherPermission;
}

export const NAV_ITEMS: TeacherNavItem[] = [
  { id: "home", label: "Home", href: "/app", icon: Home, group: "teaching", minPhase: 1, permission: "teacher.dashboard.view" },
  { id: "day", label: "My day", href: "/app/day", icon: CalendarClock, group: "teaching", minPhase: 1, permission: "teacher.timetable.view" },
  { id: "classes", label: "My classes", href: "/app/classes", icon: BookOpen, group: "teaching", minPhase: 1, permission: "teacher.load.view" },
  { id: "students", label: "Students", href: "/app/students", icon: GraduationCap, group: "teaching", minPhase: 1, permission: "teacher.students.view" },
  { id: "attendance", label: "Attendance", href: "/app/attendance", icon: CalendarCheck, group: "teaching", minPhase: 1, permission: "teacher.attendance.view" },
  { id: "homework", label: "Homework", href: "/app/homework", icon: NotebookPen, group: "teaching", minPhase: 1, permission: "teacher.homework.manage" },
  { id: "calendar", label: "Calendar", href: "/app/calendar", icon: CalendarDays, group: "teaching", minPhase: 1, permission: "teacher.timetable.view" },
  { id: "leave", label: "Leave", href: "/app/leave", icon: Briefcase, group: "teaching", minPhase: 2, permission: "teacher.portal.access" },
  { id: "lessons", label: "Lessons", href: "/app/lessons", icon: BookMarked, group: "teaching", minPhase: 2, permission: "teacher.portal.access" },
  { id: "exams", label: "Examinations", href: "/app/exams", icon: ClipboardCheck, group: "teaching", minPhase: 2, permission: "teacher.portal.access" },
  { id: "resources", label: "Resources", href: "/app/resources", icon: FolderOpen, group: "teaching", minPhase: 2, permission: "teacher.portal.access" },
  { id: "messages", label: "Messages", href: "/app/messages", icon: MessageSquare, group: "school", minPhase: 1, permission: "teacher.communication.read" },
  { id: "reports", label: "My reports", href: "/app/reports", icon: BarChart3, group: "account", minPhase: 3, permission: "teacher.portal.access" },
  { id: "profile", label: "Profile", href: "/app/profile", icon: UserRound, group: "account", minPhase: 1, permission: "teacher.profile.view" },
  { id: "settings", label: "Settings", href: "/app/settings", icon: Settings, group: "account", minPhase: 1, permission: "teacher.account.password" },
];

export function visibleNav(phase: 1 | 2 | 3) {
  return NAV_ITEMS.filter((item) => item.minPhase <= phase);
}
