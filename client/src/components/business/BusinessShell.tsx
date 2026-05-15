import { NavLink, Outlet } from "react-router-dom";
import { Briefcase, FileText, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/business/projects", label: "Projects", icon: Briefcase },
  { to: "/business/notes", label: "Notes", icon: FileText },
  { to: "/business/link-saver", label: "Link Saver", icon: Link2 },
] as const;

export function BusinessShell() {
  return (
    <div>
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 md:px-8">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                cn(
                  "inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
      <Outlet />
    </div>
  );
}
