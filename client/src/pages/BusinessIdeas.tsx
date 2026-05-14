import { motion } from "motion/react";
import { Lightbulb } from "lucide-react";

import { useTools } from "@/hooks/useTools";
import { getCategoryIcon } from "@/lib/tool-icons";
import { ToolCard } from "@/components/tools/ToolCard";
import type { ToolCategory } from "@/types/api";

const ORDER: ToolCategory[] = [
  "marketing",
  "business",
  "design",
  "video",
  "local",
  "quick",
];

export default function BusinessIdeas() {
  const { categories, byCategory, tools, isLoading } = useTools();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Lightbulb className="size-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-primary">Business Ideas</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Every AI tool, in one place
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading the full catalog…"
              : `${tools.length} tools across ${ORDER.length} categories. Pick one and start generating.`}
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="mt-10 space-y-10">
          {Array.from({ length: 3 }).map((_, s) => (
            <div key={s}>
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-32 animate-pulse rounded-xl bg-muted/50" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          {ORDER.map((category) => {
            const info = categories?.[category];
            const catTools = byCategory(category);
            if (!info || catTools.length === 0) return null;
            const Icon = getCategoryIcon(category);

            return (
              <section key={category}>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <h2 className="text-base font-semibold tracking-tight">
                    {info.label}
                  </h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {catTools.length}
                  </span>
                </div>

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
                  {catTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </motion.div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
