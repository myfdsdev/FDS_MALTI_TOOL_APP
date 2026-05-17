import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  FileText,
  FileUser,
  History,
  Lightbulb,
  LineChart,
  Link2,
  Sparkles,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { useHistory, useUsage } from "@/lib/queries";
import { getToolIcon } from "@/lib/tool-icons";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Shortcut {
  to: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SHORTCUTS: Shortcut[] = [
  {
    to: "/business-ideas",
    title: "50+ AI tools",
    description: "Browse the full catalog of business, marketing, design, and creator generators.",
    icon: Lightbulb,
  },
  {
    to: "/business/projects",
    title: "Projects & tasks",
    description: "Plan work, track due dates, and run a kanban board for every project.",
    icon: Briefcase,
  },
  {
    to: "/business/link-saver",
    title: "Link saver bank",
    description: "Save and preview useful links into a single searchable workspace.",
    icon: Link2,
  },
  {
    to: "/business/notes",
    title: "Notes",
    description: "Capture meeting notes, decisions, and project context in one place.",
    icon: FileText,
  },
  {
    to: "/business/resumes",
    title: "Resumes",
    description: "Build, polish, share, and export AI-assisted resumes.",
    icon: FileUser,
  },
  {
    to: "/business/reports",
    title: "Growth reports",
    description: "AI-powered monetization reports for any public website.",
    icon: LineChart,
  },
];

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: usage } = useUsage();
  const { data: history, isLoading: historyLoading } = useHistory({ page: 1, limit: 6 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      {/* Welcome row */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a workspace or jump back into a recent generation.
          </p>
        </div>
        {usage && (
          <div className="self-start rounded-full border border-border bg-card px-3 py-1.5 text-xs">
            <span className="font-medium tabular-nums text-foreground">
              {usage.daily.used} / {usage.daily.limit}
            </span>{" "}
            <span className="text-muted-foreground">used today</span>
          </div>
        )}
      </section>

      {/* Quick access shortcuts to the main workspaces */}
      <section className="mt-10">
        <SectionHeader title="Jump to a workspace" hint="Quick access" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
          }}
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SHORTCUTS.map((s) => (
            <motion.div
              key={s.to}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <ShortcutCard shortcut={s} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Recent generations */}
      <section className="mt-10">
        <SectionHeader
          title="Recent generations"
          action={
            <Link
              to="/history"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <Card className="mt-4">
          <CardContent className="p-0">
            {historyLoading ? (
              <ul className="divide-y divide-border">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="h-16 animate-pulse" />
                ))}
              </ul>
            ) : history && history.items.length > 0 ? (
              <ul className="divide-y divide-border">
                {history.items.slice(0, 6).map((item) => (
                  <RecentRow
                    key={item._id}
                    toolId={item.toolId}
                    inputs={item.inputs}
                    createdAt={item.createdAt}
                  />
                ))}
              </ul>
            ) : (
              <EmptyRecent />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

function ShortcutCard({ shortcut }: { shortcut: Shortcut }) {
  const Icon = shortcut.icon;
  return (
    <Link
      to={shortcut.to}
      className={cn(
        "group block h-full rounded-xl border border-border bg-card p-4 shadow-sm",
        "transition-transform hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
      )}
    >
      <div className="flex h-full items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{shortcut.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {shortcut.description}
          </p>
        </div>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
    </Link>
  );
}

function RecentRow({
  toolId,
  inputs,
  createdAt,
}: {
  toolId: string;
  inputs: Record<string, unknown>;
  createdAt: string;
}) {
  const Icon = getToolIcon(toolId);
  const snippet = useMemo(() => {
    const firstString = Object.values(inputs).find(
      (v) => typeof v === "string" && v.trim().length > 0,
    ) as string | undefined;
    if (!firstString) return "—";
    return firstString.length > 80 ? firstString.slice(0, 80) + "…" : firstString;
  }, [inputs]);
  const niceTool = toolId.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

  return (
    <li>
      <Link
        to={`/history?toolId=${encodeURIComponent(toolId)}`}
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{niceTool}</p>
          <p className="truncate text-xs text-muted-foreground">{snippet}</p>
        </div>
        <time
          dateTime={createdAt}
          className="shrink-0 text-xs text-muted-foreground tabular-nums"
        >
          {formatRelative(createdAt)}
        </time>
      </Link>
    </li>
  );
}

function EmptyRecent() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <History className="size-5" />
      </div>
      <p className="text-sm font-medium">No generations yet</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Pick a workspace above and your first result will show up here.
      </p>
      <Link
        to="/business-ideas"
        className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
      >
        <Sparkles className="size-3.5" />
        Browse tools
      </Link>
    </div>
  );
}

function formatRelative(iso: string) {
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diff < min) return "just now";
  if (diff < hour) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(iso).toLocaleDateString();
}
