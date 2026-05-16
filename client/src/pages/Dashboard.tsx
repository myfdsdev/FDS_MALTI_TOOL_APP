import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, History, Sparkles } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { useHistory, useTools, useUsage } from "@/lib/queries";
import { useTodayTasks } from "@/lib/business.queries";
import { getCategoryIcon, getToolIcon } from "@/lib/tool-icons";
import { TodayWidget } from "@/components/business/TodayWidget";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Tool, ToolCategory } from "@/types/api";

const POPULAR_TOOL_IDS = [
  "hook-generator",
  "caption-generator",
  "email-writer",
  "url-shortener",
  "color-palette",
  "business-name",
  "reel-script",
];

const PINNED_CATEGORIES: ToolCategory[] = [
  "marketing",
  "business",
  "design",
  "video",
  "local",
  "quick",
];

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: tools } = useTools();
  const { data: usage } = useUsage();
  const { data: history, isLoading: historyLoading } = useHistory({ page: 1, limit: 6 });
  const { data: todayTasks = [] } = useTodayTasks();

  const popular = useMemo(() => {
    if (!tools) return [];
    const byId = new Map(tools.tools.map((t) => [t.id, t]));
    return POPULAR_TOOL_IDS.map((id) => byId.get(id)).filter((t): t is Tool => !!t);
  }, [tools]);

  const categoryCounts = useMemo(() => {
    if (!tools) return new Map<ToolCategory, number>();
    return tools.tools.reduce((acc, t) => {
      acc.set(t.category, (acc.get(t.category) ?? 0) + 1);
      return acc;
    }, new Map<ToolCategory, number>());
  }, [tools]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      {/* Welcome row */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a tool or jump back into a recent generation.
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

      {/* Try a tool */}
      <section className="mt-10">
        <SectionHeader title="Try a tool" hint="Popular picks" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
          }}
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {popular.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-muted/50" />
              ))
            : popular.map((tool) => (
                <motion.div
                  key={tool.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <PopularToolCard tool={tool} />
                </motion.div>
              ))}
        </motion.div>
      </section>

      <section className="mt-10">
        <TodayWidget tasks={todayTasks} />
      </section>

      {/* Recent + pinned */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent generations */}
        <section className="lg:col-span-2">
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

        {/* Pinned categories */}
        <section>
          <SectionHeader title="Categories" />
          <div className="mt-4 grid grid-cols-1 gap-3">
            {tools
              ? PINNED_CATEGORIES.map((cat) => {
                  const info = tools.categories[cat];
                  if (!info) return null;
                  const count = categoryCounts.get(cat) ?? 0;
                  return (
                    <CategoryTile
                      key={cat}
                      category={cat}
                      label={info.label}
                      count={count}
                    />
                  );
                })
              : Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
                ))}
          </div>
        </section>
      </div>
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

function PopularToolCard({ tool }: { tool: Tool }) {
  const Icon = getToolIcon(tool.id);
  return (
    <Link
      to={`/tools/${tool.id}`}
      className={cn(
        "group block rounded-xl border border-border bg-card p-4 shadow-sm",
        "transition-transform hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{tool.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {tool.description}
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
        Pick a tool above and your first result will show up here.
      </p>
      <Link
        to="/dashboard"
        className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
      >
        <Sparkles className="size-3.5" />
        Browse tools
      </Link>
    </div>
  );
}

function CategoryTile({
  category,
  label,
  count,
}: {
  category: ToolCategory;
  label: string;
  count: number;
}) {
  const Icon = getCategoryIcon(category);
  return (
    <Link
      to={`/category/${category}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:bg-accent"
    >
      <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{count} tools</p>
      </div>
      <ArrowRight className="size-4 text-muted-foreground" />
    </Link>
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
