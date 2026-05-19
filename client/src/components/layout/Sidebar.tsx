import { useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Briefcase,
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  FileUser,
  Lightbulb,
  LineChart,
  Link2,
  LayoutGrid,
  History,
  Wallet,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";
import { useTools } from "@/lib/queries";
import { useAuthStore } from "@/stores/auth.store";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import type { WorkspaceKey } from "@/types/featureFlags";
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
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapsed }: SidebarProps) {
  const { data } = useTools();
  const toolCount = data?.tools.length;

  // On mobile the sidebar is a drawer that's always full width; collapsed only applies on desktop.
  const isCollapsed = collapsed;

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
          "fixed inset-y-0 left-0 z-40 transform border-r border-border bg-sidebar text-sidebar-foreground transition-[transform,width] duration-200",
          "md:sticky md:top-0 md:h-screen md:translate-x-0",
          // Mobile: drawer is always full width when open
          open ? "w-72 translate-x-0" : "w-72 -translate-x-full",
          // Desktop width depends on collapsed state
          isCollapsed ? "md:w-16" : "md:w-72",
        )}
        aria-label="Primary navigation"
      >
        <div className="flex h-full flex-col">
          {/* Header: logo + toggle */}
          <div
            className={cn(
              "flex items-center border-b border-sidebar-border py-4",
              isCollapsed ? "md:justify-center md:px-2" : "justify-between px-5",
            )}
          >
            {isCollapsed ? (
              <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="hidden size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:flex"
              >
                <PanelLeftOpen className="size-4" />
              </button>
            ) : (
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="size-7 rounded-md bg-primary" />
                <span className="font-semibold tracking-tight">Multitool</span>
              </Link>
            )}

            <div className="flex items-center gap-1">
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={onToggleCollapsed}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className="hidden rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:inline-flex"
                >
                  <PanelLeftClose className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:hidden"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              <SidebarItem to="/dashboard" icon={LayoutGrid} label="Dashboard" onNavigate={onClose} collapsed={isCollapsed} />
              <SidebarItem to="/gigs" icon={BriefcaseBusiness} label="Gigs" onNavigate={onClose} collapsed={isCollapsed} end={false} />
              <SidebarItem to="/history" icon={History} label="History" onNavigate={onClose} collapsed={isCollapsed} />
              <FinanceNavItem onNavigate={onClose} collapsed={isCollapsed} />
              <AdminNavItem onNavigate={onClose} collapsed={isCollapsed} />
            </ul>

            <div className="mt-6">
              {!isCollapsed && (
                <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tools
                </p>
              )}
              <ul className="space-y-1">
                <BusinessIdeasNav onNavigate={onClose} collapsed={isCollapsed} />
                <BusinessManagementNav onNavigate={onClose} collapsed={isCollapsed} />
              </ul>
            </div>
          </nav>

          {!isCollapsed && (
            <div className="border-t border-sidebar-border p-3">
              <Link
                to="/business-ideas"
                className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-xs text-foreground hover:bg-primary/15"
              >
                <Sparkles className="size-4 text-primary" />
                <span>{toolCount ? `${toolCount} tools available` : "Tools available"}</span>
              </Link>
            </div>
          )}
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
  collapsed,
  end = true,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onNavigate: () => void;
  collapsed: boolean;
  end?: boolean;
}) {
  return (
    <li>
      <NavLink
        to={to}
        onClick={onNavigate}
        end={end}
        title={collapsed ? label : undefined}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md text-sm font-medium transition-colors",
            collapsed ? "justify-center px-2 py-2" : "px-3 py-2",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )
        }
      >
        <Icon className="size-4 shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </NavLink>
    </li>
  );
}

function FinanceNavItem({
  onNavigate,
  collapsed,
}: {
  onNavigate: () => void;
  collapsed: boolean;
}) {
  const { isWorkspaceDisabled } = useFeatureFlags();
  if (isWorkspaceDisabled("finance")) return null;
  return (
    <SidebarItem
      to="/finance"
      icon={Wallet}
      label="Finance"
      onNavigate={onNavigate}
      collapsed={collapsed}
      end={false}
    />
  );
}

function AdminNavItem({
  onNavigate,
  collapsed,
}: {
  onNavigate: () => void;
  collapsed: boolean;
}) {
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  if (!isAdmin) return null;
  return <SidebarItem to="/admin" icon={Shield} label="Admin" onNavigate={onNavigate} collapsed={collapsed} />;
}

interface BusinessSubItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  workspace: WorkspaceKey;
}

const BUSINESS_SUB_ITEMS: BusinessSubItem[] = [
  { to: "/business/projects", label: "Projects", icon: Briefcase, workspace: "projects" },
  { to: "/business/reports", label: "Growth Reports", icon: LineChart, workspace: "reports" },
  { to: "/business/notes", label: "Notes", icon: FileText, workspace: "notes" },
  { to: "/business/link-saver", label: "Link Saver", icon: Link2, workspace: "link-saver" },
  { to: "/business/resumes", label: "Resumes", icon: FileUser, workspace: "resumes" },
];

function BusinessManagementNav({
  onNavigate,
  collapsed,
}: {
  onNavigate: () => void;
  collapsed: boolean;
}) {
  const location = useLocation();
  const inSection = location.pathname.startsWith("/business");
  const [open, setOpen] = useState(inSection);
  const { isWorkspaceDisabled, isAnyWorkspaceEnabled } = useFeatureFlags();

  const visibleSubItems = BUSINESS_SUB_ITEMS.filter(
    (item) => !isWorkspaceDisabled(item.workspace)
  );

  // If every Business sub-section is hidden, drop the whole group from the nav.
  if (!isAnyWorkspaceEnabled(BUSINESS_SUB_ITEMS.map((i) => i.workspace))) {
    return null;
  }

  // Collapsed: render as a single icon link to the hub.
  if (collapsed) {
    return (
      <li>
        <NavLink
          to="/business"
          onClick={onNavigate}
          title="Business management"
          className={({ isActive }) =>
            cn(
              "flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )
          }
        >
          <Briefcase className="size-4" />
        </NavLink>
      </li>
    );
  }

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
            {visibleSubItems.map(({ to, label, icon: Icon }) => (
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
function BusinessIdeasNav({
  onNavigate,
  collapsed,
}: {
  onNavigate: () => void;
  collapsed: boolean;
}) {
  const location = useLocation();
  const inSection = /^\/(business-ideas|tools|category)/.test(location.pathname);
  const [open, setOpen] = useState(inSection);
  const { isWorkspaceDisabled, isToolDisabled } = useFeatureFlags();

  const { data, isLoading } = useTools();

  const grouped = useMemo(() => {
    if (!data) return [] as Array<{ category: ToolCategory; label: string; tools: Tool[] }>;
    return CATEGORY_ORDER.filter((c) => data.categories[c]).map((c) => ({
      category: c,
      label: data.categories[c].label,
      tools: data.tools.filter((t) => t.category === c && !isToolDisabled(t.id)),
    }));
  }, [data, isToolDisabled]);

  // Admin disabled the entire Business Ideas workspace — hide the nav entry.
  if (isWorkspaceDisabled("ideas")) return null;

  if (collapsed) {
    return (
      <li>
        <NavLink
          to="/business-ideas"
          onClick={onNavigate}
          end
          title="Business Ideas"
          className={({ isActive }) =>
            cn(
              "flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )
          }
        >
          <Lightbulb className="size-4" />
        </NavLink>
      </li>
    );
  }

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
