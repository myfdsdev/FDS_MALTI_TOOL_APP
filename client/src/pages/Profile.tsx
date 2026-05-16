import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Clock3,
  History as HistoryIcon,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCircle2,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { useHistory, useTools, useUsage } from "@/lib/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmailVerificationCard } from "@/components/auth/EmailVerificationCard";
import { AiSettingsCard } from "@/components/profile/AiSettingsCard";
import { cn } from "@/lib/utils";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const { data: usage, isLoading: usageLoading } = useUsage();
  const { data: history, isLoading: historyLoading } = useHistory({ page: 1, limit: 4 });
  const { data: tools } = useTools();

  const toolMap = new Map(tools?.tools.map((tool) => [tool.id, tool]) ?? []);

  const latestRun = history?.items[0];
  const recentCategory = (() => {
    if (!history?.items.length) return null;

    const counts = new Map<string, number>();
    for (const item of history.items) {
      const category = toolMap.get(item.toolId)?.category;
      if (!category) continue;
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    let winner: string | null = null;
    let max = 0;
    for (const [category, count] of counts) {
      if (count > max) {
        winner = category;
        max = count;
      }
    }
    return winner;
  })();

  if (!user) {
    return (
      <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-16 md:px-8">
        <Card className="w-full max-w-xl">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserCircle2 className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium">Profile data is not ready yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Refresh the page or sign in again to load your account details.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <AvatarBlock
              name={user.name}
              email={user.email}
              avatar={user.avatar}
            />

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-primary">Profile</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
                  {user.name}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Your account area follows the same card, spacing, and color system as the
                  rest of the workspace. Profile editing is read-only for now until the backend
                  exposes an update endpoint.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusPill icon={Mail} label={user.email} />
                <StatusPill
                  icon={ShieldCheck}
                  label={user.provider === "google" ? "Google account" : "Email account"}
                />
                <StatusPill
                  icon={BadgeCheck}
                  label={user.emailVerified ? "Verified email" : "Verification pending"}
                  tone={user.emailVerified ? "primary" : "muted"}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            <StatTile
              label="Today"
              value={
                usageLoading || !usage
                  ? "..."
                  : `${usage.daily.used} / ${usage.daily.limit}`
              }
              hint="Daily generations"
            />
            <StatTile
              label="This month"
              value={
                usageLoading || !usage
                  ? "..."
                  : `${usage.monthly.used} / ${usage.monthly.limit}`
              }
              hint="Monthly usage"
            />
            <StatTile
              label="All time"
              value={usageLoading || !usage ? "..." : String(usage.total)}
              hint="Total generations"
            />
          </div>
        </div>
      </section>

      <AiSettingsCard />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>
              Session-backed details from your authenticated account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField label="Full name" value={user.name} />
            <ReadOnlyField label="Email address" value={user.email} />
            <ReadOnlyField
              label="Provider"
              value={user.provider === "google" ? "Google" : "Email and password"}
            />
            <ReadOnlyField
              label="Member since"
              value={formatDate(user.createdAt) ?? "Recently"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace snapshot</CardTitle>
            <CardDescription>Quick status that matches the rest of your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SnapshotRow
              icon={Sparkles}
              label="Plan"
              value={usage ? capitalize(usage.plan) : "Loading"}
            />
            <SnapshotRow
              icon={Clock3}
              label="Latest generation"
              value={latestRun ? formatRelative(latestRun.createdAt) : "No activity yet"}
            />
            <SnapshotRow
              icon={HistoryIcon}
              label="Most active category"
              value={recentCategory ? capitalize(recentCategory) : "Not enough data yet"}
            />
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
              Appearance follows the dark mode toggle in the topbar and persists locally,
              so this page always stays in sync with your current theme.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <EmailVerificationCard />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>
                A quick glance at the last few generations from this account.
              </CardDescription>
            </div>
            <Link
              to="/history"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Open history
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {historyLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-xl bg-muted/50" />
              ))
            ) : history && history.items.length > 0 ? (
              history.items.map((item) => {
                const tool = toolMap.get(item.toolId);
                return (
                  <div
                    key={item._id}
                    className="rounded-xl border border-border bg-background/70 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {tool?.name ?? prettifyToolId(item.toolId)}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {firstStringSnippet(item.inputs)}
                        </p>
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground">
                        {formatRelative(item.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
                <p className="text-sm font-medium">No generations yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Once you start using tools, your activity summary will show up here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What is next</CardTitle>
            <CardDescription>
              Helpful shortcuts while the profile area stays read-only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ActionLink
              to="/dashboard"
              title="Return to dashboard"
              description="Jump back to your suggested tools, categories, and recent work."
            />
            <ActionLink
              to="/history"
              title="Review history"
              description="Open full generation history with filters and inline output previews."
            />
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium">Profile editing</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Name, avatar, and preferences can be made editable once the backend exposes
                account update endpoints. Right now this page is intentionally accurate to the
                current API contract.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AvatarBlock({
  name,
  email,
  avatar,
}: {
  name: string;
  email: string;
  avatar?: string;
}) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-border bg-background text-xl font-semibold text-foreground shadow-sm">
      {avatar ? (
        <img src={avatar} alt={`${name} avatar`} className="size-full object-cover" />
      ) : (
        initials
      )}
      <div className="absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-white/10" />
      <span className="sr-only">{email}</span>
    </div>
  );
}

function StatusPill({
  icon: Icon,
  label,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone?: "default" | "muted" | "primary";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm",
        tone === "primary" && "border-primary/20 bg-primary/10 text-primary",
        tone === "muted" && "border-border bg-card/80 text-muted-foreground",
        tone === "default" && "border-border bg-card/80 text-foreground",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/80 p-4 shadow-sm backdrop-blur">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} readOnly aria-readonly="true" />
    </div>
  );
}

function SnapshotRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background/70 p-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function ActionLink({
  to,
  title,
  description,
}: {
  to: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="block rounded-xl border border-border bg-background/70 p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

function firstStringSnippet(inputs: Record<string, unknown>): string {
  const firstValue = Object.values(inputs).find(
    (value) => typeof value === "string" && value.trim().length > 0,
  ) as string | undefined;

  if (!firstValue) return "No text input recorded.";
  return firstValue.length > 120 ? `${firstValue.slice(0, 120)}...` : firstValue;
}

function prettifyToolId(id: string): string {
  return id.replace(/-/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function capitalize(value: string): string {
  return value.replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatRelative(value: string): string {
  const timestamp = new Date(value).getTime();
  const diff = Date.now() - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return formatDate(value) ?? "recently";
}
