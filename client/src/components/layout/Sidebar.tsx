import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Briefcase, ChevronDown, FileText, Lightbulb, Link2, LayoutGrid, History, Shield, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";
import { useTools } from "@/lib/queries";
import { useAuthStore } from "@/stores/auth.store";
import { getCategoryIcon, getToolIcon } from "@/lib/tool-icons";
import type { Tool, ToolCategory } from "@/types/api";

const CATEGORY_ORDER: ToolCategory[] = [
  "marketing",
  "business",
  "design",
  "video",
  "local",
  "quick",
];

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
              <BusinessManagementNav onNavigate={onClose} />
              <SidebarItem to="/history" icon={History} label="History" onNavigate={onClose} />
              <AdminNavItem onNavigate={onClose} />
            </ul>

            <div className="mt-6">
              <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tools
              </p>
              <ul className="space-y-1">
                <BusinessIdeasNav onNavigate={onClose} />
              </ul>
            </div>
          </nav>

          <div className="border-t border-sidebar-border p-3">
            <Link
              to="/business-ideas"
              className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-xs text-foreground hover:bg-primary/15"
            >
              <Sparkles className="size-4 text-primary" />
              <span>50 AI tools available</span>
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
  end = true,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onNavigate: () => void;
  end?: boolean;
}) {
  return (
    <li>
      <NavLink
        to={to}
        onClick={onNavigate}
        end={end}
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

function AdminNavItem({ onNavigate }: { onNavigate: () => void }) {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  if (!isAdmin) return null;
  return <SidebarItem to="/admin" icon={Shield} label="Admin" onNavigate={onNavigate} />;
}

const BUSINESS_SUB_ITEMS = [
  { to: "/business/projects", label: "Projects", icon: Briefcase },
  { to: "/business/notes", label: "Notes", icon: FileText },
  { to: "/business/link-saver", label: "Link Saver", icon: Link2 },
] as const;

function BusinessManagementNav({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation();
  const inSection = location.pathname.startsWith("/business");
  const [open, setOpen] = useState(inSection);

  return (
    <li>
      <div
        className={cn(
          "flex items-center rounded-md transition-colors",
          inSection
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <NavLink
          to="/business"
          onClick={onNavigate}
          className="flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
        >
          <Briefcase className="size-4" />
          Business management
        </NavLink>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Collapse business management" : "Expand business management"}
          className="rounded-md p-2"
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {BUSINESS_SUB_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "ml-3 mt-1 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )
                  }
                >
                  <Icon className="size-3.5" />
                  {label}
                </NavLink>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

/**
 * "Business Ideas" — navigates to the catalog page, and the chevron expands a
 * dropdown of the tool categories (each itself expandable to its tools).
 */
function BusinessIdeasNav({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation();
  const inSection = /^\/(business-ideas|tools|category)/.test(location.pathname);
  const [open, setOpen] = useState(inSection);

  const { data, isLoading } = useTools();

  const grouped = useMemo(() => {
    if (!data) return [] as Array<{ category: ToolCategory; label: string; tools: Tool[] }>;
    return CATEGORY_ORDER.filter((c) => data.categories[c]).map((c) => ({
      category: c,
      label: data.categories[c].label,
      tools: data.tools.filter((t) => t.category === c),
    }));
  }, [data]);

  return (
    <li>
      <div
        className={cn(
          "flex items-center rounded-md transition-colors",
          inSection
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <NavLink
          to="/business-ideas"
          onClick={onNavigate}
          end
          className="flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
        >
          <Lightbulb className="size-4" />
          Business Ideas
        </NavLink>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Collapse categories" : "Expand categories"}
          className="rounded-md p-2"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {isLoading ? (
              <ul className="mt-1 space-y-1.5 pl-3" aria-hidden>
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i} className="h-8 animate-pulse rounded-md bg-muted/50" />
                ))}
              </ul>
            ) : (
              <ul className="mt-1 space-y-0.5 pl-3">
                {grouped.map((g) => (
                  <CategoryGroup key={g.category} group={g} onNavigate={onNavigate} />
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function CategoryGroup({
  group,
  onNavigate,
}: {
  group: { category: ToolCategory; label: string; tools: Tool[] };
  onNavigate: () => void;
}) {
  const location = useLocation();
  const hasActiveTool = group.tools.some(
    (t) => location.pathname === `/tools/${t.id}`,
  );
  const onCategoryPage = location.pathname === `/category/${group.category}`;
  const [open, setOpen] = useState(hasActiveTool);
  const CategoryIcon = getCategoryIcon(group.category);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          onCategoryPage
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <CategoryIcon className="size-4" />
        <span className="flex-1 text-left">{group.label}</span>
        <span className="text-xs text-muted-foreground">{group.tools.length}</span>
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
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
