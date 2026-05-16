import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  FileText,
  FileUser,
  Link2,
  ListChecks,
  Sparkles,
} from "lucide-react";

import { useTools } from "@/hooks/useTools";
import { ToolCard } from "@/components/tools/ToolCard";
import { useStats, useTodayTasks } from "@/lib/business.queries";
import { cn } from "@/lib/utils";

const WORKSPACE_TOOLS = [
  {
    to: "/business/notes",
    title: "Notes",
    description: "Capture decisions, meeting notes, and project context in one searchable space.",
    icon: FileText,
  },
  {
    to: "/business/link-saver",
    title: "Link Saver",
    description: "Preview useful links and save the best ones directly into your notes.",
    icon: Link2,
  },
  {
    to: "/business/resumes",
    title: "Resumes",
    description: "Build, improve, share, and export polished resumes from your workspace.",
    icon: FileUser,
  },
] as const;

export default function BusinessManagement() {
  const { categories, byCategory, isLoading } = useTools();
  const { data: stats } = useStats();
  const { data: todayTasks = [] } = useTodayTasks();
  const businessTools = byCategory("business");
  const totalWorkspaceTools = WORKSPACE_TOOLS.length + 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase className="size-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-primary">Business management</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Run your business workspace
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Manage projects, capture notes, save resources, build resumes, and generate
              business assets without leaving this workspace.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:min-w-[24rem]">
          <HeaderMetric label="Workspace" value={String(totalWorkspaceTools)} />
          <HeaderMetric label="AI tools" value={isLoading ? "..." : String(businessTools.length)} />
          <HeaderMetric label="Due now" value={String(todayTasks.length)} />
        </div>
      </header>

      <section className="mt-10">
        <SectionTitle
          icon={CalendarClock}
          title="Workspace"
          count={totalWorkspaceTools}
          description="Start with project operations, then jump into supporting business tools."
        />

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
          }}
          className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]"
        >
          <FeaturedProjectsCard
            totalProjects={stats?.totalProjects ?? 0}
            activeProjects={stats?.activeProjects ?? 0}
            totalTasks={stats?.totalTasks ?? 0}
            overdueCount={stats?.overdueCount ?? 0}
          />

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {WORKSPACE_TOOLS.map((tool) => (
              <WorkspaceToolCard key={tool.to} tool={tool} />
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mt-12">
        <SectionTitle
          icon={Sparkles}
          title={categories?.business?.label ?? "Business AI tools"}
          count={businessTools.length}
          description="Generate names, offers, proposals, client replies, summaries, and reports."
        />

        {isLoading ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-xl bg-muted/50" />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.03 } },
            }}
            className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {businessTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[11px] font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  count,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {count}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

function FeaturedProjectsCard({
  totalProjects,
  activeProjects,
  totalTasks,
  overdueCount,
}: {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  overdueCount: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
      }}
    >
      <Link
        to="/business/projects"
        className={cn(
          "group flex min-h-72 h-full flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm",
          "transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        )}
      >
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Briefcase className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Projects</h3>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  The main command center for boards, lists, calendars, notes, and today's
                  priorities.
                </p>
              </div>
            </div>
            <ArrowRight className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <ProjectStat label="Projects" value={totalProjects} />
            <ProjectStat label="Active" value={activeProjects} />
            <ProjectStat label="Tasks" value={totalTasks} />
            <ProjectStat
              label="Overdue"
              value={overdueCount}
              tone={overdueCount > 0 ? "warn" : "default"}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
            <ListChecks className="size-3.5" />
            Board, calendar, list, and notes
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
            <CalendarClock className="size-3.5" />
            Due-today tracking
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function ProjectStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "warn";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background/70 p-3",
        tone === "warn" && "border-destructive/30 bg-destructive/5"
      )}
    >
      <p className="text-[11px] font-medium uppercase text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums",
          tone === "warn" && "text-destructive"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function WorkspaceToolCard({
  tool,
}: {
  tool: (typeof WORKSPACE_TOOLS)[number];
}) {
  const Icon = tool.icon;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
      }}
    >
      <Link
        to={tool.to}
        className={cn(
          "group flex h-full min-h-36 flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm",
          "transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{tool.title}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {tool.description}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary">
          Open tool
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}
