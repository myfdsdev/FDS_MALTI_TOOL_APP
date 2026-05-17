import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, Loader2, Save, Search, ToggleLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { extractErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAdminFeatureFlags, useUpdateFeatureFlags } from "@/hooks/useFeatureFlags";
import { useTools } from "@/hooks/useTools";
import { ALL_WORKSPACE_KEYS, WORKSPACE_LABELS } from "@/types/featureFlags";
import type { WorkspaceKey } from "@/types/featureFlags";
import type { ToolCategory } from "@/types/api";

const CATEGORY_ORDER: ToolCategory[] = [
  "marketing",
  "business",
  "design",
  "video",
  "local",
  "quick",
];

export function FeatureFlagsPanel() {
  const { data, isLoading } = useAdminFeatureFlags();
  const update = useUpdateFeatureFlags();
  const { tools, categories } = useTools();

  const [disabledTools, setDisabledTools] = useState<Set<string>>(new Set());
  const [disabledWorkspaces, setDisabledWorkspaces] = useState<Set<WorkspaceKey>>(new Set());
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"" | ToolCategory>("");

  // Hydrate local state from server data.
  useEffect(() => {
    if (!data) return;
    setDisabledTools(new Set(data.disabledTools));
    setDisabledWorkspaces(new Set(data.disabledWorkspaces));
  }, [data]);

  const baseDisabledTools = useMemo(() => new Set(data?.disabledTools ?? []), [data]);
  const baseDisabledWorkspaces = useMemo(
    () => new Set(data?.disabledWorkspaces ?? []),
    [data]
  );

  const isDirty = useMemo(() => {
    if (!data) return false;
    if (disabledTools.size !== baseDisabledTools.size) return true;
    for (const t of disabledTools) if (!baseDisabledTools.has(t)) return true;
    if (disabledWorkspaces.size !== baseDisabledWorkspaces.size) return true;
    for (const w of disabledWorkspaces) if (!baseDisabledWorkspaces.has(w)) return true;
    return false;
  }, [data, disabledTools, disabledWorkspaces, baseDisabledTools, baseDisabledWorkspaces]);

  const filteredTools = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tools.filter((t) => {
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  }, [tools, search, categoryFilter]);

  const toggleTool = (id: string) => {
    setDisabledTools((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleWorkspace = (key: WorkspaceKey) => {
    setDisabledWorkspaces((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const bulkSetVisibleTools = (visible: boolean) => {
    setDisabledTools((prev) => {
      const next = new Set(prev);
      for (const t of filteredTools) {
        if (visible) next.delete(t.id);
        else next.add(t.id);
      }
      return next;
    });
  };

  const save = async () => {
    try {
      await update.mutateAsync({
        disabledTools: Array.from(disabledTools),
        disabledWorkspaces: Array.from(disabledWorkspaces),
      });
      toast.success("Feature flags saved");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't save flags"));
    }
  };

  const reset = () => {
    if (!data) return;
    setDisabledTools(new Set(data.disabledTools));
    setDisabledWorkspaces(new Set(data.disabledWorkspaces));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading feature flags…
        </CardContent>
      </Card>
    );
  }

  const visibleToolsCount = filteredTools.length - filteredTools.filter((t) => disabledTools.has(t.id)).length;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1 border-b border-border pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <ToggleLeft className="size-5 text-primary" />
            Feature flags
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              disabled={!isDirty || update.isPending}
            >
              Reset
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void save()}
              disabled={!isDirty || update.isPending}
            >
              {update.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save changes
            </Button>
          </div>
        </div>
        <CardDescription>
          Globally hide tools and workspaces from <strong>every user</strong> on the site.
          Admins still see everything. Disabling here also blocks the matching write API endpoints.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 pt-6">
        {/* Workspaces */}
        <section>
          <header className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Workspaces</h3>
              <p className="text-xs text-muted-foreground">
                Hide entire sections of the app (Projects, Reports, Resumes, etc.)
              </p>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {ALL_WORKSPACE_KEYS.length - disabledWorkspaces.size} / {ALL_WORKSPACE_KEYS.length} enabled
            </span>
          </header>
          <ul className="grid gap-2 sm:grid-cols-2">
            {ALL_WORKSPACE_KEYS.map((key) => {
              const disabled = disabledWorkspaces.has(key);
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => toggleWorkspace(key)}
                    aria-pressed={!disabled}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      disabled
                        ? "border-border bg-muted/40 text-muted-foreground"
                        : "border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {disabled ? (
                        <EyeOff className="size-4 text-muted-foreground" />
                      ) : (
                        <Eye className="size-4 text-primary" />
                      )}
                      <span className="text-sm font-medium">{WORKSPACE_LABELS[key]}</span>
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        disabled ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
                      )}
                    >
                      {disabled ? "Hidden" : "Visible"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Tools */}
        <section>
          <header className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold">AI tools</h3>
              <p className="text-xs text-muted-foreground">
                Hide individual generators from the catalog. Disabled tools return 403 on generate.
              </p>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {visibleToolsCount} / {filteredTools.length} visible in view
            </span>
          </header>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tools…"
                className="pl-9"
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as "" | ToolCategory)}
              className="sm:w-56"
            >
              <option value="">All categories</option>
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {categories?.[cat]?.label ?? cat}
                </option>
              ))}
            </Select>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => bulkSetVisibleTools(true)}
                disabled={filteredTools.length === 0}
              >
                Show all
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => bulkSetVisibleTools(false)}
                disabled={filteredTools.length === 0}
              >
                Hide all
              </Button>
            </div>
          </div>

          <ul className="mt-4 max-h-[28rem] divide-y divide-border overflow-y-auto rounded-lg border border-border">
            {filteredTools.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                No tools match this filter.
              </li>
            ) : (
              filteredTools.map((tool) => {
                const disabled = disabledTools.has(tool.id);
                return (
                  <motion.li
                    key={tool.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className={cn("truncate text-sm font-medium", disabled && "text-muted-foreground line-through")}>
                        {tool.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {categories?.[tool.category]?.label ?? tool.category} · <span className="font-mono">{tool.id}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTool(tool.id)}
                      aria-pressed={!disabled}
                      title={disabled ? "Click to enable" : "Click to disable"}
                      className={cn(
                        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium transition-colors",
                        disabled
                          ? "border-border bg-muted text-muted-foreground hover:bg-muted/70"
                          : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                      )}
                    >
                      {disabled ? <><EyeOff className="size-3" /> Hidden</> : <><Eye className="size-3" /> Visible</>}
                    </button>
                  </motion.li>
                );
              })
            )}
          </ul>
        </section>

        {isDirty && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            You have unsaved changes. Click <strong>Save changes</strong> to apply globally.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
