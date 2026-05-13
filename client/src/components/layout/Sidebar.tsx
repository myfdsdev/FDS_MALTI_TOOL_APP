import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, LayoutGrid, History, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";
import { useTools } from "@/lib/queries";
import { getCategoryIcon, getToolIcon } from "@/lib/tool-icons";
import type { Tool, ToolCategory } from "@/types/api";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 transform border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-200",
          "md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Primary navigation"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="size-7 rounded-md bg-primary" />
              <span className="font-semibold tracking-tight">Multitool</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:hidden"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              <SidebarItem to="/dashboard" icon={LayoutGrid} label="Dashboard" onNavigate={onClose} />
              <SidebarItem to="/history" icon={History} label="History" onNavigate={onClose} />
            </ul>

            <div className="mt-6">
              <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tools
              </p>
              <CategoryTree onNavigate={onClose} />
            </div>
          </nav>

          <div className="border-t border-sidebar-border p-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-xs text-foreground hover:bg-primary/15"
            >
              <Sparkles className="size-4 text-primary" />
              <span>28 AI tools available</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({
  to,
  icon: Icon,
  label,
  onNavigate,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <li>
      <NavLink
        to={to}
        onClick={onNavigate}
        end
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )
        }
      >
        <Icon className="size-4" />
        {label}
      </NavLink>
    </li>
  );
}

function CategoryTree({ onNavigate }: { onNavigate: () => void }) {
  const { data, isLoading } = useTools();

  const grouped = useMemo(() => {
    if (!data) return [] as Array<{ category: ToolCategory; label: string; tools: Tool[] }>;
    const order: ToolCategory[] = ["marketing", "business", "design", "video", "local"];
    return order
      .filter((c) => data.categories[c])
      .map((c) => ({
        category: c,
        label: data.categories[c].label,
        tools: data.tools.filter((t) => t.category === c),
      }));
  }, [data]);

  if (isLoading) {
    return (
      <ul className="space-y-2 px-3" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="h-8 animate-pulse rounded-md bg-muted/50" />
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-1">
      {grouped.map((g) => (
        <CategoryGroup key={g.category} group={g} onNavigate={onNavigate} />
      ))}
    </ul>
  );
}

function CategoryGroup({
  group,
  onNavigate,
}: {
  group: { category: ToolCategory; label: string; tools: Tool[] };
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const CategoryIcon = getCategoryIcon(group.category);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <CategoryIcon className="size-4" />
        <span className="flex-1 text-left">{group.label}</span>
        <span className="text-xs text-muted-foreground">{group.tools.length}</span>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {group.tools.map((tool) => {
              const ToolIcon = getToolIcon(tool.id);
              return (
                <li key={tool.id}>
                  <NavLink
                    to={`/tools/${tool.id}`}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "ml-3 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )
                    }
                  >
                    <ToolIcon className="size-3.5" />
                    <span className="truncate">{tool.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}
