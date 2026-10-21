"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, Menu, Settings, UserRound } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { ACADEMIC_YEAR_LABEL, SCHOOL_NAME } from "@/config/app";
import { Avatar } from "@/components/ui/Avatar";
import { useUiStore } from "@/stores/ui";
import { formatLongDate } from "@/lib/dates";

export function Header() {
  const { session, signOut } = useAuth();
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const name = session?.displayName ?? "Teacher";

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-[var(--header-height)] items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border md:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold md:text-base">{SCHOOL_NAME}</p>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {formatLongDate(new Date())} · School local time
        </p>
      </div>

      <span className="hidden rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium sm:inline">
        {ACADEMIC_YEAR_LABEL}
      </span>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="flex items-center gap-2 rounded-lg border border-border bg-card py-1.5 pr-2.5 pl-1.5 hover:bg-muted"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <Avatar name={name} />
          <span className="hidden max-w-[8rem] truncate text-sm font-medium md:inline">{name}</span>
        </button>
        {menuOpen ? (
          <div role="menu" className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-md">
            <Link href="/app/profile" role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setMenuOpen(false)}>
              <UserRound className="h-4 w-4" />
              My Profile
            </Link>
            <Link href="/app/settings" role="menuitem" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setMenuOpen(false)}>
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger-muted"
              onClick={() => {
                setMenuOpen(false);
                signOut();
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
