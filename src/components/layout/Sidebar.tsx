"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { APP_SHORT_NAME } from "@/config/app";
import { isChildActive, isNavActive, visibleNav, type TeacherNavItem } from "@/config/navigation";
import { useUiStore } from "@/stores/ui";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

function NavList({
  collapsed,
  items,
  unread,
  onNavigate,
}: {
  collapsed: boolean;
  items: TeacherNavItem[];
  unread: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState<{ path: string; open: Record<string, boolean> }>({
    path: pathname,
    open: {},
  });
  const openOverrides = menuState.path === pathname ? menuState.open : {};
  if (menuState.path !== pathname) {
    setMenuState({ path: pathname, open: {} });
  }
  const sections = [
    { label: "Teaching", group: "teaching" as const },
    { label: "School", group: "school" as const },
    { label: "Account", group: "account" as const },
  ];

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {sections.map((section) => {
        const sectionItems = items.filter((item) => item.group === section.group);
        if (sectionItems.length === 0) return null;
        return (
          <div key={section.label} className="space-y-1">
            {!collapsed ? (
              <p className="px-2 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {section.label}
              </p>
            ) : null}
            {sectionItems.map((item) => {
              const active = isNavActive(pathname, item.href, item.activeHrefs);
              const expanded = Boolean(item.children) && !collapsed && (openOverrides[item.id] ?? active);
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  <div
                    className={cn(
                      "flex w-full items-stretch rounded-lg transition-colors",
                      active
                        ? "bg-brand-muted font-medium text-brand"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Link
                      href={item.href}
                      title={item.label}
                      onClick={onNavigate}
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-3 px-2.5 py-2 text-sm",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed ? (
                        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                          <span className="truncate">{item.label}</span>
                          {item.id === "messages" && unread > 0 ? (
                            <Badge variant="danger" className="px-1.5 py-0 text-[10px]">
                              {unread > 9 ? "9+" : unread}
                            </Badge>
                          ) : null}
                        </span>
                      ) : item.id === "messages" && unread > 0 ? (
                        <span className="sr-only">{unread} unread messages</span>
                      ) : null}
                    </Link>
                    {!collapsed && item.children ? (
                      <button
                        type="button"
                        className="inline-flex w-9 shrink-0 items-center justify-center"
                        aria-expanded={expanded}
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${item.label}`}
                        onClick={() =>
                          setMenuState({
                            path: pathname,
                            open: { ...openOverrides, [item.id]: !expanded },
                          })
                        }
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                      </button>
                    ) : null}
                  </div>
                  {expanded && item.children ? (
                    <div className="mt-1 ml-6 space-y-1 border-l border-border pl-2">
                      {item.children.map((child) => {
                        const childActive = isChildActive(pathname, child, item.children ?? []);
                        return (
                          <Link
                            key={child.id}
                            href={child.href}
                            onClick={onNavigate}
                            aria-current={childActive ? "page" : undefined}
                            className={cn(
                              "flex min-h-9 items-center gap-2 rounded-lg px-2 py-2 text-xs",
                              childActive
                                ? "bg-brand-muted font-medium text-brand"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            {child.icon ? <child.icon className="h-3.5 w-3.5 shrink-0" /> : null}
                            <span className="min-w-0 leading-snug">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({ unread }: { unread: number }) {
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } = useUiStore();
  const items = visibleNav();

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 md:flex",
          sidebarCollapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]",
        )}
      >
        <div className="flex h-[var(--header-height)] items-center justify-between gap-2 border-b border-border px-3">
          {!sidebarCollapsed ? (
            <div className="min-w-0 px-1">
              <p className="truncate text-sm font-semibold tracking-tight">{APP_SHORT_NAME}</p>
              <p className="truncate text-xs text-muted-foreground">Teachers Portal</p>
            </div>
          ) : (
            <span className="mx-auto text-sm font-bold text-brand">S</span>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
        <NavList collapsed={sidebarCollapsed} items={items} unread={unread} />
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-card shadow-md">
            <div className="flex h-[var(--header-height)] items-center justify-between border-b border-border px-4">
              <div>
                <p className="text-sm font-semibold">{APP_SHORT_NAME}</p>
                <p className="text-xs text-muted-foreground">Teachers Portal</p>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavList
              collapsed={false}
              items={items}
              unread={unread}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
