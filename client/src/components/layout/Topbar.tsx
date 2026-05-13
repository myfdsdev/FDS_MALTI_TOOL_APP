import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu, Moon, Sun, User as UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout, useUsage } from "@/lib/queries";
import { useTheme } from "@/hooks/useTheme";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { isDark, toggle } = useTheme();
  const crumbs = useBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <nav aria-label="Breadcrumb" className="hidden flex-1 items-center gap-1.5 text-sm md:flex">
        {crumbs.map((c, i) => (
          <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-muted-foreground">/</span>}
            {c.to ? (
              <Link to={c.to} className="text-muted-foreground hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <UsageChip />

        <button
          type="button"
          onClick={toggle}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>

        <UserMenu
          user={user ? { name: user.name, email: user.email, avatar: user.avatar } : null}
          onLogout={() => logout.mutate()}
        />
      </div>
    </header>
  );
}

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return [{ label: "Dashboard", to: "/dashboard" as string | undefined }];
  const crumbs: { label: string; to?: string }[] = [{ label: "Home", to: "/dashboard" }];
  let acc = "";
  for (let i = 0; i < parts.length; i++) {
    acc += `/${parts[i]}`;
    const isLast = i === parts.length - 1;
    crumbs.push({
      label: prettify(parts[i]),
      to: isLast ? undefined : acc,
    });
  }
  return crumbs;
}

function prettify(seg: string) {
  return seg.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function UsageChip() {
  const { data, isLoading } = useUsage();
  if (isLoading || !data) {
    return <div className="hidden h-7 w-24 animate-pulse rounded-full bg-muted sm:block" aria-hidden />;
  }
  const { used, limit } = data.daily;
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const tone = pct >= 90 ? "text-destructive" : "text-foreground";
  return (
    <div
      className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs sm:flex"
      title={`${used} of ${limit} generations used today`}
    >
      <span className="relative inline-block h-1.5 w-12 overflow-hidden rounded-full bg-muted">
        <span
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            pct >= 90 ? "bg-destructive" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className={cn("font-medium tabular-nums", tone)}>
        {used} / {limit} today
      </span>
    </div>
  );
}

function UserMenu({
  user,
  onLogout,
}: {
  user: { name: string; email: string; avatar?: string } | null;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initials = user?.name
    ? user.name
        .split(/\s+/)
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-8 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-xs font-semibold text-foreground hover:opacity-90"
        aria-label="User menu"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="size-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium">{user?.name ?? "Account"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            role="menuitem"
          >
            <UserIcon className="size-4" />
            Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            role="menuitem"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
