import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Lightbulb } from "lucide-react";

import { useTools } from "@/hooks/useTools";

export function CategoryGrid() {
  const { tools, isLoading } = useTools();
  const toolCount = tools.length;

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          Built for every part of your business
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          One workspace for the tools your business needs. Pick a tool and start working.
        </p>
      </div>

      {/* One box for now — more tool boxes can be added here later. */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="h-44 animate-pulse rounded-xl bg-muted/50" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Link
              to="/business-ideas"
              className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Lightbulb className="size-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">Business Idea Generator</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {toolCount} tools
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary">
                Explore
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
