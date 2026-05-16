import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  FileText,
  FileUser,
  Link2,
  Sparkles,
} from "lucide-react";

import { useTools } from "@/hooks/useTools";
import { ToolCard } from "@/components/tools/ToolCard";
import { cn } from "@/lib/utils";

const WORKSPACE_TOOLS = [
  {
    to: "/business/projects",
    title: "Projects",
    description: "Plan work, track due dates, manage boards, and keep daily priorities clear.",
    icon: Briefcase,
  },
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
  const businessTools = byCategory("business");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Briefcase className="size-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-primary">Business management</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Business tools, in one place
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Open a workspace tool or generate business assets with AI.
          </p>
        </div>
      </header>

      <section className="mt-10">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarClock className="size-4" />
          </div>
          <h2 className="text-base font-semibold tracking-tight">Workspace tools</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {WORKSPACE_TOOLS.length}
          </span>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
          }}
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {WORKSPACE_TOOLS.map((tool) => (
            <WorkspaceToolCard key={tool.to} tool={tool} />
          ))}
        </motion.div>
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <h2 className="text-base font-semibold tracking-tight">
            {categories?.business?.label ?? "Business"}
          </h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {businessTools.length}
          </span>
        </div>

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
          "group flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm",
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
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary">
          Open tool
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>
    </motion.div>
  );
}
