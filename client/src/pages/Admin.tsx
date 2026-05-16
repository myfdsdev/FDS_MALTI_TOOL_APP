import { useEffect, useState, type ComponentType } from "react";
import {
  BarChart3,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  useAdminStats,
  useAdminUsers,
  useDeleteUser,
  useUpdateUser,
} from "@/lib/queries";
import { extractErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AdminUser, Plan, UserRole } from "@/types/api";

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
              Usage metrics and account management for the whole workspace.
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
