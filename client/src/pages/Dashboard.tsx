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
  Wallet,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { useHistory, useUsage } from "@/lib/queries";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { getToolIcon } from "@/lib/tool-icons";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WorkspaceKey } from "@/types/featureFlags";

interface Shortcut {
  to: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  workspace: WorkspaceKey;
}

const SHORTCUTS: Shortcut[] = [
  {
    to: "/business-ideas",
    title: "50+ AI tools",
    description: "Browse the full catalog of business, marketing, design, and creator generators.",
    icon: Lightbulb,
    workspace: "ideas",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARQmYQkA-1BRYYz__Isf9lSU-wzXtCej8vdcDLTmeCT59oqs756sS2rNwkHWvNB-OrodEbIlKbD572ou1OF32lyuP7JKlLyfK-WDjEbpER_kdslEzXCBg2fVqDui4G7KIQoOhVriEZ7T2pRZ5Jbd6JJflCFHvlvEbrZTSpUT3_SSCoAiRPbEdra6VyCyNT-yl-dYl3KJFT_Fx2cbG-kAmqj9H9G4MBuEOpxChbhyyNsN02ii45e9Ybm0Q_2bVp5MF-0cQXY80Y9I0",
  },
  {
    to: "/finance",
    title: "Personal finance",
    description: "Track expenses, salary, budgets, and savings goals in one place.",
    icon: Wallet,
    workspace: "finance",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=60",
  },
  {
    to: "/business/projects",
    title: "Projects & tasks",
    description: "Plan work, track due dates, and run a kanban board for every project.",
    icon: Briefcase,
    workspace: "projects",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDjq9c21IpYkWsZhzQBU6eahmnfLwBl9rCGR8drSl1OMaP7Y_IvUipXeXMUjma-PUeQbUBWujmF2yWJ3N8w-3RV-BwI4eVsCTuVcW2JuO3LbOqVdLBYl1p6-AmAdJbiCNfQrEHPsPFrQJMTh3Qtzjst70GS71M4vPXJtEMF-9XC0aa63QFWyp3S8wqLraJg8asFREKLd0H0InPV2nIgrwF36XmqXCcfqrMJcz9m8ca-KOmwQww0P_au9qpUAoAhWH8jCIXO3h35KJM",
  },
  {
    to: "/business/link-saver",
    title: "Link saver bank",
    description: "Save and preview useful links into a single searchable workspace.",
    icon: Link2,
    workspace: "link-saver",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB1u50snpIgRrOlMZM-8TTgXnxaCVi3NBO1JIMiflMqHoDhAB_1KVAiwr2b8ns4rVGrkExAjDwl1RdQcGU7LdMgLPrhLVq7HrFL0Cd6DD23RPv5y0sdRYvFLL1EkzI4tPO50eSEoxvwTtIibyrOOfk5B4EfGLHWHjPhVEcImOD8ox8m8MK3JjD0B0OUs3_OhSHXlLMdpFT372EUCtynt899JA0-j3N1eZUO0QRVOEgK2uPgrlhxCZFUnaycleHuxS8-EEPRE7KTSoE",
  },
  {
    to: "/business/notes",
    title: "Notes",
    description: "Capture meeting notes, decisions, and project context in one place.",
    icon: FileText,
    workspace: "notes",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBRGhIKb6WgUZm4Ui3I0C6Go2JxNmwZjwINOKimx0brfy533PhgGuIZi8WhmyfVZ3CG9oBGKtCqcoIXnXemyLI-9s7LDeItev49_0XQM6X2rQeNJB0s18Dv3jmwGtAjpVw_XUPPxkpMduMWxequ2C1fWH7JpTHZjjLTOUHB-1y7aVeU4SzkYnagFinSi5juU9rrz1CZvFqBgLjaASAvwXadIPRN-InTnABkrwzcWcSNk2c927QhDpRWAgHRwiZyIbsgESrT2y8wSV0",
  },
  {
    to: "/business/resumes",
    title: "Resumes",
    description: "Build, polish, share, and export AI-assisted resumes.",
    icon: FileUser,
    workspace: "resumes",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAy95eGurCug9zCudwF5cRg65XIjlQEGZC72DK-v0_zVu00oLBL3-RDH_-aEofDgy5ShPt1ywNIC9SP46DVjtcDGfj-eSF1xb479SF_yndt_fhgxjYd__2oDaKPHeEsApe6lWq67tsmV86helzTigjXGMB9hERNBpCGxwLqMmB6fjQVw37lWe3VhZ-F3-FYD2KqvBbLbgc92SEu3fvhitHl1VUmwabeFFyjSJaNdBZQmY7ptngycgfQqg0xbq3XqfPLGxAhV9NC_L4",
  },
  {
    to: "/business/reports",
    title: "Growth reports",
    description: "AI-powered monetization reports for any public website.",
    icon: LineChart,
    workspace: "reports",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDJVY9wXslL4Xxi6x6DBaktkP26rkbbSzdQ4ovCi-X6v9mxJm4iHKjQcQqVv6PzIxvrnQZtU1R-BesI0-XR1fOHltIThfhTr4vRRFdTOR0vFKuU1jDXwifIR1nordK9G0n3q--QKSylfPlNVBSHEDQ9fPUC9D8cGVtge_3uv7E8UXgfbybtRMyyJw0BgB0wnyg9yCDOKKjX-MsW54sVuoKF1S9JV_wy1O8W9dHb1ksUaRuFIhQRYErhjgLQbCkZAnB3eHP5yTX4h7s",
  },
];

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const { data: usage } = useUsage();
  const { data: history, isLoading: historyLoading } = useHistory({ page: 1, limit: 6 });
  const { isWorkspaceDisabled } = useFeatureFlags();
  const visibleShortcuts = SHORTCUTS.filter((s) => !isWorkspaceDisabled(s.workspace));

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
          <div className="self-start rounded-md border border-border bg-card px-3 py-1.5 text-[11px] font-medium">
            <span className="tabular-nums text-foreground">
              {usage.daily.used} / {usage.daily.limit}
            </span>{" "}
            <span className="text-muted-foreground">used today</span>
          </div>
        )}
      </section>

      {/* Workspace grid (image-thumbnail cards) */}
      <section className="mt-10">
        <SectionHeader title="Jump to a workspace" hint="Quick access" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
          }}
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visibleShortcuts.length === 0 ? (
            <p className="col-span-full rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              All workspaces are currently disabled by the site admin.
            </p>
          ) : (
            visibleShortcuts.map((s) => (
              <motion.div
                key={s.to}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <WorkspaceCard shortcut={s} />
              </motion.div>
            ))
          )}
        </motion.div>
      </section>

      {/* Recent generations */}
      <section className="mt-12">
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
        <h2 className="text-sm font-bold tracking-tight">{title}</h2>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

function WorkspaceCard({ shortcut }: { shortcut: Shortcut }) {
  const Icon = shortcut.icon;
  return (
    <Link
      to={shortcut.to}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-md shadow-sm",
        "transition-colors hover:border-primary/50 hover:shadow-md",
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={shortcut.image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(ev) => {
            (ev.target as HTMLImageElement).style.display = "none";
          }}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/40 via-transparent to-transparent" />
        <div className="pointer-events-none absolute left-3 top-3 flex size-8 items-center justify-center rounded-md bg-background/85 text-primary backdrop-blur">
          <Icon className="size-4" />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold tracking-tight">{shortcut.title}</h3>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary group-hover:translate-x-0.5" />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {shortcut.description}
        </p>
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
