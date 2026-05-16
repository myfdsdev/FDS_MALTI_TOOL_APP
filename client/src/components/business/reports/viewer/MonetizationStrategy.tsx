import { Target } from "lucide-react";
import { motion } from "motion/react";
import type { MonetizationStrategy as Strategy } from "@/types/reports";

interface Props {
  strategy: Strategy;
}

export function MonetizationStrategy({ strategy }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Target className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Primary monetization path
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">
            {strategy.primaryPath || "No primary path identified"}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {strategy.reasoning}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
