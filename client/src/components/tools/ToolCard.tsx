import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { getToolIcon } from "@/lib/tool-icons";
import type { Tool } from "@/types/api";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = getToolIcon(tool.id);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
      }}
    >
      <Link
        to={`/tools/${tool.id}`}
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
            <h3 className="truncate text-sm font-semibold">{tool.name}</h3>
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
