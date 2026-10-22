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
  Mail,
  MessageSquare,
  Package,
  UtensilsCrossed,
  NotebookPen,
  Salad,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  Wallet,
  BadgeIndianRupee,
  type LucideIcon,
} from "lucide-react";
import type { TeacherPermission } from "@/types/domain";

export interface TeacherNavChild {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  activeHrefs?: string[];
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
  },
  { id: "homework", label: "Homework", href: "/app/homework", icon: NotebookPen, group: "teaching", permission: "teacher.homework.manage" },
  {
    id: "curriculum",
    label: "Curriculum",
    href: "/app/curriculum",
    icon: BookMarked,
    group: "teaching",
    permission: "teacher.load.view",
    activeHrefs: ["/app/curriculum", "/app/syllabus", "/app/lessons"],
    children: [
      { id: "subjects", label: "Subjects and syllabus", href: "/app/curriculum", activeHrefs: ["/app/curriculum", "/app/syllabus"] },
      { id: "lessons", label: "Lesson plans", href: "/app/curriculum/lessons", activeHrefs: ["/app/curriculum/lessons", "/app/lessons"] },
    ],
  },
  {
    id: "exams",
    label: "Examinations",
    href: "/app/exams",
    icon: ClipboardCheck,
    group: "teaching",
    permission: "teacher.portal.access",
    activeHrefs: ["/app/exams", "/app/performance"],
    children: [
      { id: "exam-schedule", label: "Schedule and marks", href: "/app/exams" },
      { id: "performance", label: "Performance", href: "/app/performance" },
    ],
  },
  { id: "resources", label: "Resources", href: "/app/resources", icon: FolderOpen, group: "teaching", permission: "teacher.portal.access" },
  { id: "behaviour", label: "Behaviour", href: "/app/behaviour", icon: ShieldAlert, group: "teaching", permission: "teacher.portal.access" },
  {
    id: "canteen",
    label: "Canteen / Cafeteria",
    href: "/app/canteen",
    icon: UtensilsCrossed,
    group: "school",
    permission: "teacher.portal.access",
    activeHrefs: ["/app/canteen"],
    children: [
      { id: "canteen-dashboard", label: "Canteen Dashboard", href: "/app/canteen", icon: LayoutDashboard },
      { id: "canteen-menu", label: "Menu", href: "/app/canteen/menu", icon: UtensilsCrossed },
      { id: "canteen-food", label: "Food Item", href: "/app/canteen/food-items", icon: Salad },
      { id: "canteen-pricing", label: "Pricing", href: "/app/canteen/pricing", icon: BadgeIndianRupee },
      { id: "canteen-mail", label: "Mail", href: "/app/canteen/mail", icon: Mail },
      { id: "canteen-orders", label: "Orders / Sales", href: "/app/canteen/orders", icon: ShoppingBag },
      { id: "canteen-wallet", label: "Mail / Wallet", href: "/app/canteen/wallet", icon: Wallet },
      { id: "canteen-stock", label: "Stock Consumption", href: "/app/canteen/stock", icon: Package },
      { id: "canteen-purchase", label: "Food Purchase", href: "/app/canteen/purchases", icon: ShoppingCart },
      { id: "canteen-safety", label: "Food Safety / Compliance", href: "/app/canteen/safety", icon: ShieldCheck },
      { id: "canteen-report", label: "Canteen Report", href: "/app/canteen/reports", icon: BarChart3 },
    ],
  },
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
  return targets.some((target) => matchesNavTarget(pathname, target));
}

function matchesNavTarget(pathname: string, target: string) {
  return target === "/app" ? pathname === "/app" : pathname === target || pathname.startsWith(`${target}/`);
}

function matchLength(pathname: string, targets: string[]) {
  return targets.reduce((best, target) => {
    return matchesNavTarget(pathname, target) ? Math.max(best, target.length) : best;
  }, 0);
}

export function isChildActive(pathname: string, child: TeacherNavChild, children: TeacherNavChild[]) {
  const targets = child.activeHrefs ?? [child.href];
  const length = matchLength(pathname, targets);
  if (length === 0) return false;
  return children.every((other) => {
    if (other.id === child.id) return true;
    const otherLength = matchLength(pathname, other.activeHrefs ?? [other.href]);
    return otherLength <= length;
  });
}
