import {
  BarChart3,
  BookMarked,
  BookOpen,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  FolderOpen,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  NotebookPen,
  Settings,
  ShieldAlert,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { TeacherPermission } from "@/types/domain";

export interface TeacherNavChild {
  id: string;
  label: string;
  href: string;
}

export interface TeacherNavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  group: "teaching" | "school" | "account";
  permission: TeacherPermission;
  activeHrefs?: string[];
  children?: TeacherNavChild[];
}

export const NAV_ITEMS: TeacherNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/app", icon: LayoutDashboard, group: "teaching", permission: "teacher.dashboard.view" },
  {
    id: "timetable",
    label: "Timetable",
    href: "/app/timetable",
    icon: CalendarDays,
    group: "teaching",
    permission: "teacher.timetable.view",
    activeHrefs: ["/app/timetable", "/app/day"],
  },
  {
    id: "classes",
    label: "My Classes",
    href: "/app/classes",
    icon: BookOpen,
    group: "teaching",
    permission: "teacher.load.view",
    activeHrefs: ["/app/classes", "/app/students"],
    children: [
      { id: "class-list", label: "Assigned classes", href: "/app/classes" },
      { id: "students", label: "Students", href: "/app/students" },
    ],
  },
  {
    id: "attendance",
    label: "Attendance",
    href: "/app/attendance",
    icon: CalendarCheck,
    group: "teaching",
    permission: "teacher.attendance.view",
    children: [
      { id: "student-attendance", label: "Student attendance", href: "/app/attendance" },
      { id: "my-attendance", label: "My attendance", href: "/app/attendance?view=mine" },
    ],
  },
  { id: "homework", label: "Homework", href: "/app/homework", icon: NotebookPen, group: "teaching", permission: "teacher.homework.manage" },
  {
    id: "curriculum",
    label: "Curriculum",
    href: "/app/curriculum",
    icon: BookMarked,
    group: "teaching",
    permission: "teacher.load.view",
    children: [
      { id: "subjects", label: "Subjects and syllabus", href: "/app/curriculum" },
      { id: "lessons", label: "Lesson plans", href: "/app/curriculum/lessons" },
    ],
  },
  {
    id: "exams",
    label: "Examinations",
    href: "/app/exams",
    icon: ClipboardCheck,
    group: "teaching",
    permission: "teacher.portal.access",
    children: [
      { id: "exam-schedule", label: "Schedule and marks", href: "/app/exams" },
      { id: "performance", label: "Performance", href: "/app/performance" },
    ],
  },
  { id: "resources", label: "Resources", href: "/app/resources", icon: FolderOpen, group: "teaching", permission: "teacher.portal.access" },
  { id: "behaviour", label: "Behaviour", href: "/app/behaviour", icon: ShieldAlert, group: "teaching", permission: "teacher.portal.access" },
  { id: "leave", label: "Leave", href: "/app/leave", icon: Briefcase, group: "school", permission: "teacher.portal.access" },
  { id: "calendar", label: "Calendar", href: "/app/calendar", icon: CalendarDays, group: "school", permission: "teacher.timetable.view" },
  { id: "messages", label: "Messages", href: "/app/messages", icon: MessageSquare, group: "school", permission: "teacher.communication.read" },
  { id: "reports", label: "Reports", href: "/app/reports", icon: BarChart3, group: "school", permission: "teacher.portal.access" },
  { id: "profile", label: "Profile", href: "/app/profile", icon: UserRound, group: "account", permission: "teacher.profile.view" },
  { id: "help", label: "Help", href: "/app/help", icon: LifeBuoy, group: "account", permission: "teacher.portal.access" },
  { id: "settings", label: "Settings", href: "/app/settings", icon: Settings, group: "account", permission: "teacher.account.password" },
];

export function visibleNav() {
  return NAV_ITEMS;
}

export function isNavActive(pathname: string, href: string, activeHrefs?: string[]) {
  const targets = activeHrefs ?? [href];
  return targets.some((target) => (target === "/app" ? pathname === "/app" : pathname === target || pathname.startsWith(`${target}/`)));
}
