import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  BarChart3,
  Globe,
  KeyRound,
  Loader2,
  Save,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  useAdminSettings,
  useAdminStats,
  useAdminUsers,
  useDeleteUser,
  useUpdateSettings,
  useUpdateUser,
} from "@/lib/queries";
import { extractErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AdminUser, AiProvider, Plan, UserRole } from "@/types/api";

const PROVIDER_OPTIONS: Array<{ value: AiProvider; label: string }> = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "gemini", label: "Google Gemini" },
  { value: "openai-compatible", label: "OpenAI-compatible" },
];

const MODEL_SUGGESTIONS: Record<AiProvider, string[]> = {
  anthropic: ["claude-sonnet-4-5", "claude-3-7-sonnet-latest", "claude-3-5-haiku-latest"],
  openai: ["gpt-4.1", "gpt-4.1-mini", "gpt-4o-mini"],
  gemini: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"],
  "openai-compatible": ["openai/gpt-4.1-mini", "meta-llama/llama-3.3-70b-instruct", "deepseek-chat"],
};

const PAGE_SIZE = 20;

export default function Admin() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | UserRole>("");
  const [planFilter, setPlanFilter] = useState<"" | Plan>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: users, isLoading: usersLoading, isFetching } = useAdminUsers({
    page,
    limit: PAGE_SIZE,
    search: debounced || undefined,
    role: roleFilter || undefined,
    plan: planFilter || undefined,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm md:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(60% 80% at 10% 10%, color-mix(in oklch, var(--primary) 18%, transparent) 0%, transparent 62%), radial-gradient(40% 50% at 90% 20%, color-mix(in oklch, var(--primary) 10%, transparent) 0%, transparent 70%)",
          }}
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Administration</p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Workspace overview
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Usage metrics, provider configuration, and account management for the whole
              workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
            <StatTile
              icon={Users}
              label="Users"
              value={statsLoading || !stats ? "..." : String(stats.users.total)}
              hint={stats ? `${stats.users.admins} admin` : ""}
            />
            <StatTile
              icon={ShieldCheck}
              label="Verified"
              value={statsLoading || !stats ? "..." : String(stats.users.verified)}
              hint="Email confirmed"
            />
            <StatTile
              icon={Sparkles}
              label="Generations"
              value={statsLoading || !stats ? "..." : String(stats.generations.total)}
              hint="All time"
            />
            <StatTile
              icon={TrendingUp}
              label="Today"
              value={statsLoading || !stats ? "..." : String(stats.generations.today)}
              hint="Generations"
            />
          </div>
        </div>
      </section>

      <AiSettingsCard />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Plan distribution</CardTitle>
            <CardDescription>How accounts split across plans.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {statsLoading || !stats ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-9 animate-pulse rounded-lg bg-muted/50" />
              ))
            ) : (
              (["free", "pro", "team"] as Plan[]).map((plan) => {
                const count = stats.users.byPlan[plan] ?? 0;
                const pct = stats.users.total > 0 ? Math.round((count / stats.users.total) * 100) : 0;
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{plan}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {count} | {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <BarChart3 className="size-4 text-muted-foreground" />
            <CardTitle>Top tools</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading || !stats ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-8 animate-pulse rounded-lg bg-muted/50" />
                ))}
              </div>
            ) : stats.topTools.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No generations recorded yet.
              </p>
            ) : (
              <ol className="space-y-1.5">
                {stats.topTools.map((tool, index) => {
                  const max = stats.topTools[0].count || 1;
                  const pct = Math.round((tool.count / max) * 100);
                  return (
                    <li
                      key={tool.toolId}
                      className="flex items-center gap-3 rounded-lg border border-border bg-background/60 px-3 py-2"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{tool.toolName}</p>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary/70"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-medium tabular-nums">
                        {tool.count}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle>Users</CardTitle>
            <CardDescription>Search accounts and adjust roles or plans.</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email..."
                className="pl-8 sm:w-56"
              />
            </div>
            <Select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value as "" | UserRole);
                setPage(1);
              }}
              className="sm:w-32"
            >
              <option value="">All roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </Select>
            <Select
              value={planFilter}
              onChange={(event) => {
                setPlanFilter(event.target.value as "" | Plan);
                setPage(1);
              }}
              className="sm:w-32"
            >
              <option value="">All plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="team">Team</option>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {usersLoading ? (
            <ul className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, index) => (
                <li key={index} className="flex items-center gap-3 px-6 py-4">
                  <div className="size-9 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted/70" />
                  </div>
                </li>
              ))}
            </ul>
          ) : users && users.items.length > 0 ? (
            <>
              <ul className="divide-y divide-border">
                {users.items.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </ul>
              <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-3">
                <p className="text-xs text-muted-foreground tabular-nums">
                  Page {users.pagination.page} of {users.pagination.pages} |{" "}
                  {users.pagination.total} user{users.pagination.total === 1 ? "" : "s"}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= users.pagination.pages || isFetching}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Users className="size-5" />
              </div>
              <p className="text-sm font-medium">No users match these filters</p>
              <p className="text-xs text-muted-foreground">
                Try clearing the search or filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/80 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  const currentUser = useAuthStore((state) => state.user);
  const update = useUpdateUser();
  const remove = useDeleteUser();
  const isSelf = currentUser?.id === user.id;

  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onChange = async (patch: { role?: UserRole; plan?: Plan }) => {
    try {
      await update.mutateAsync({ id: user.id, ...patch });
      toast.success(`Updated ${user.name}`);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't update user"));
    }
  };

  const onDelete = async () => {
    if (
      !confirm(
        `Delete ${user.name} (${user.email})? This permanently removes the account and all its generation history.`,
      )
    ) {
      return;
    }

    try {
      await remove.mutateAsync(user.id);
      toast.success(`Deleted ${user.name}`);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't delete user"));
    }
  };

  const busy = update.isPending || remove.isPending;

  return (
    <li className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-xs font-semibold">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="size-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{user.name}</p>
            {isSelf && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                You
              </span>
            )}
            {user.role === "admin" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                Admin
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 font-medium",
            user.emailVerified
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
          )}
        >
          {user.emailVerified ? "Verified" : "Unverified"}
        </span>
        <span className="tabular-nums">{user.totalGenerations} gen</span>
      </div>

      <div className="flex items-center gap-2">
        <Select
          aria-label={`Role for ${user.name}`}
          value={user.role}
          disabled={busy || isSelf}
          onChange={(event) => onChange({ role: event.target.value as UserRole })}
          className="h-9 w-24 text-xs"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Select>
        <Select
          aria-label={`Plan for ${user.name}`}
          value={user.plan}
          disabled={busy}
          onChange={(event) => onChange({ plan: event.target.value as Plan })}
          className="h-9 w-24 text-xs"
        >
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="team">Team</option>
        </Select>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy || isSelf}
          title={isSelf ? "You can't delete your own account" : "Delete user"}
          aria-label={`Delete ${user.name}`}
          className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
        >
          {remove.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
        {update.isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>
    </li>
  );
}

function AiSettingsCard() {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateSettings();

  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<AiProvider>("anthropic");
  const [model, setModel] = useState("claude-sonnet-4-5");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (!settings) return;
    setProvider(settings.aiProvider);
    setModel(settings.aiModel);
    setBaseUrl(settings.aiBaseUrl || "");
  }, [settings]);

  const suggestions = useMemo(() => MODEL_SUGGESTIONS[provider], [provider]);

  const onSave = async () => {
    const payload: {
      aiProvider: AiProvider;
      aiModel: string;
      aiBaseUrl?: string;
      aiApiKey?: string;
    } = {
      aiProvider: provider,
      aiModel: model.trim(),
      aiBaseUrl: baseUrl.trim(),
    };

    if (apiKey.trim() !== "") payload.aiApiKey = apiKey.trim();

    try {
      await updateSettings.mutateAsync(payload);
      setApiKey("");
      toast.success("AI settings saved");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't save settings"));
    }
  };

  const onClearKey = async () => {
    if (!confirm("Remove the stored API key? The app will fall back to environment config or mock output.")) {
      return;
    }

    try {
      await updateSettings.mutateAsync({ aiApiKey: "" });
      setApiKey("");
      toast.success("Stored API key removed");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't remove key"));
    }
  };

  const envLabel = settings?.envProvider
    ? PROVIDER_OPTIONS.find((option) => option.value === settings.envProvider)?.label ||
      settings.envProvider
    : null;

  return (
    <Card className="mt-6">
      <CardHeader className="flex-row items-start gap-3 space-y-0">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <KeyRound className="size-4" />
        </div>
        <div className="space-y-1.5">
          <CardTitle>AI provider</CardTitle>
          <CardDescription>
            Configure the provider, model, and optional base URL used for tool generation.
            Supports Anthropic, OpenAI, Gemini, and OpenAI-compatible endpoints.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {isLoading ? (
            <span className="h-6 w-40 animate-pulse rounded-full bg-muted" />
          ) : settings?.hasApiKey ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-medium text-primary">
              <ShieldCheck className="size-3.5" />
              Stored key configured ({settings.keyPreview})
            </span>
          ) : settings?.usingEnvFallback ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 font-medium text-muted-foreground">
              <Server className="size-3.5" />
              Using env fallback{envLabel ? `: ${envLabel}` : ""}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 font-medium text-amber-600 dark:text-amber-400">
              No key - tools return mock output
            </span>
          )}

          {settings && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-medium text-muted-foreground">
              <Globe className="size-3.5" />
              {settings.aiProvider}
            </span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ai-provider">Provider</Label>
            <Select
              id="ai-provider"
              value={provider}
              onChange={(event) => setProvider(event.target.value as AiProvider)}
            >
              {PROVIDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-model">Model</Label>
            <Input
              id="ai-model"
              list="ai-model-suggestions"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Enter a model id"
            />
            <datalist id="ai-model-suggestions">
              {suggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground">
              Free-form model id. Suggestions update with the provider.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ai-api-key">API key</Label>
            <Input
              id="ai-api-key"
              type="password"
              autoComplete="off"
              placeholder={settings?.hasApiKey ? "Enter a new key to replace" : "Paste an API key"}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to keep the current stored key.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-base-url">Base URL</Label>
            <Input
              id="ai-base-url"
              type="url"
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              placeholder="https://openrouter.ai/api/v1"
            />
            <p className="text-xs text-muted-foreground">
              Optional. Useful for OpenAI-compatible providers such as OpenRouter, Groq,
              Together, or self-hosted gateways.
            </p>
          </div>
        </div>

        {settings?.usingEnvFallback && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p>
              Env fallback provider: <span className="font-medium text-foreground">{settings.envProvider}</span>
            </p>
            {settings.envModel && (
              <p className="mt-1">
                Env fallback model: <span className="font-medium text-foreground">{settings.envModel}</span>
              </p>
            )}
            {settings.envBaseUrl && (
              <p className="mt-1 break-all">
                Env fallback base URL: <span className="font-medium text-foreground">{settings.envBaseUrl}</span>
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onSave} disabled={updateSettings.isPending || !model.trim()}>
            {updateSettings.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save settings
          </Button>
          {settings?.hasApiKey && (
            <Button variant="outline" onClick={onClearKey} disabled={updateSettings.isPending}>
              Remove key
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
