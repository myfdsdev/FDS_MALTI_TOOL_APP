import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, History as HistoryIcon, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ToolOutput } from "@/components/tools/ToolOutput";
import { cn } from "@/lib/utils";
import { extractErrorMessage } from "@/lib/api";
import { useDeleteHistoryItem, useHistory, useTools } from "@/lib/queries";
import { getToolIcon } from "@/lib/tool-icons";
import type { Generation, Tool } from "@/types/api";

const PAGE_SIZE = 20;

export default function History() {
  const [params, setParams] = useSearchParams();
  const toolId = params.get("toolId") || "";
  const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);

  const { data: tools } = useTools();
  const { data, isLoading, isFetching } = useHistory({
    page,
    limit: PAGE_SIZE,
    toolId: toolId || undefined,
  });

  const [expanded, setExpanded] = useState<string | null>(null);

  const toolMap = useMemo(() => {
    const m = new Map<string, Tool>();
    tools?.tools.forEach((t) => m.set(t.id, t));
    return m;
  }, [tools]);

  const updateParams = (next: Record<string, string | null>) => {
    const merged = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === "") merged.delete(k);
      else merged.set(k, v);
    }
    setParams(merged, { replace: true });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every generation you&rsquo;ve run. Click a row to expand.
          </p>
        </div>

        <div className="flex items-end gap-2">
          <div className="w-full min-w-[200px] sm:w-64">
            <label htmlFor="toolFilter" className="sr-only">
              Filter by tool
            </label>
            <Select
              id="toolFilter"
              value={toolId}
              onChange={(e) => updateParams({ toolId: e.target.value || null, page: "1" })}
            >
              <option value="">All tools</option>
              {tools?.tools.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </header>

      <div className="mt-6">
        {isLoading ? (
          <SkeletonList />
        ) : data && data.items.length > 0 ? (
          <>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {data.items.map((item) => (
                    <Row
                      key={item._id}
                      item={item}
                      tool={toolMap.get(item.toolId)}
                      expanded={expanded === item._id}
                      onToggle={() =>
                        setExpanded((cur) => (cur === item._id ? null : item._id))
                      }
                    />
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Pager
              page={data.pagination.page}
              pages={data.pagination.pages}
              total={data.pagination.total}
              busy={isFetching}
              onPage={(p) => {
                setExpanded(null);
                updateParams({ page: String(p) });
              }}
            />
          </>
        ) : (
          <EmptyState filtered={!!toolId} />
        )}
      </div>
    </div>
  );
}

function Row({
  item,
  tool,
  expanded,
  onToggle,
}: {
  item: Generation;
  tool?: Tool;
  expanded: boolean;
  onToggle: () => void;
}) {
  const del = useDeleteHistoryItem();
  const Icon = getToolIcon(item.toolId);
  const toolName = tool?.name ?? prettifyToolId(item.toolId);
  const snippet = useMemo(() => firstStringSnippet(item.inputs), [item.inputs]);
  const inputEntries = useMemo(() => Object.entries(item.inputs ?? {}), [item.inputs]);

  const onDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this generation? This can't be undone.")) return;
    try {
      await del.mutateAsync(item._id);
      toast.success("Deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't delete"));
    }
  };

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50",
          expanded && "bg-accent/40",
        )}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{toolName}</p>
          <p className="truncate text-xs text-muted-foreground">{snippet}</p>
        </div>
        <time
          dateTime={item.createdAt}
          className="hidden shrink-0 text-xs text-muted-foreground tabular-nums sm:block"
        >
          {formatRelative(item.createdAt)}
        </time>
        <button
          type="button"
          onClick={onDelete}
          disabled={del.isPending}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
          aria-label="Delete generation"
        >
          {del.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border bg-background/60 px-4 py-4 sm:px-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Inputs
                  </h3>
                  {inputEntries.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">No inputs recorded.</p>
                  ) : (
                    <dl className="mt-2 space-y-2">
                      {inputEntries.map(([k, v]) => (
                        <div
                          key={k}
                          className="rounded-md border border-border bg-card px-3 py-2"
                        >
                          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            {prettifyKey(k)}
                          </dt>
                          <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm">
                            {formatInputValue(v)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </section>

                <section>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Output
                  </h3>
                  <div className="mt-2">
                    <ToolOutput toolId={item.toolId} output={item.output} />
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function Pager({
  page,
  pages,
  total,
  busy,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  busy: boolean;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) {
    return (
      <p className="mt-4 text-xs text-muted-foreground">
        {total} item{total === 1 ? "" : "s"}
      </p>
    );
  }
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground tabular-nums">
        Page {page} of {pages} · {total} items
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || busy}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages || busy}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="size-9 animate-pulse rounded-md bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted/70" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 px-6 py-16 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <HistoryIcon className="size-5" />
        </div>
        <p className="text-sm font-medium">
          {filtered ? "No generations match this filter" : "No generations yet"}
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          {filtered
            ? "Try clearing the tool filter to see everything."
            : "Pick a tool from the sidebar and your runs will show up here."}
        </p>
      </CardContent>
    </Card>
  );
}

/* ───── helpers ───────────────────────────────────────── */

function firstStringSnippet(inputs: Record<string, unknown>): string {
  const v = Object.values(inputs).find(
    (x) => typeof x === "string" && x.trim().length > 0,
  ) as string | undefined;
  if (!v) return "—";
  return v.length > 100 ? v.slice(0, 100) + "…" : v;
}

function prettifyKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function prettifyToolId(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatInputValue(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function formatRelative(iso: string): string {
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
