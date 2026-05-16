import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Briefcase, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "business:activeTab";

interface Tab {
  key: "projects" | "calendar";
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { key: "projects", label: "Projects", to: "/business/projects", icon: Briefcase },
  { key: "calendar", label: "Calendar", to: "/business/calendar", icon: CalendarDays },
];

function activeKeyFor(pathname: string): Tab["key"] {
  if (pathname.startsWith("/business/calendar")) return "calendar";
  return "projects";
}

export function BusinessTabs() {
  const location = useLocation();
  const active = activeKeyFor(location.pathname);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, active);
    } catch {
      // Ignore — localStorage may be unavailable (private mode).
    }
  }, [active]);

  return (
    <nav
      aria-label="Business sections"
      className="border-b border-border bg-background/60 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 md:px-8">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              to={tab.to}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-4" />
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="business-tab-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", bounce: 0.18, duration: 0.4 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
