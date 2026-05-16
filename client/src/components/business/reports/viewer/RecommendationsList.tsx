import { useState } from "react";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Props {
  recommendations: string[];
}

export function RecommendationsList({ recommendations }: Props) {
  const [done, setDone] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">Top recommendations</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Prioritized actions. Tick them off as you ship.
        </p>
      </header>
      <ul className="mt-4 space-y-2">
        {recommendations.map((rec, i) => {
          const checked = done.has(i);
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={checked}
                className="flex w-full items-start gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-accent/40"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  )}
                >
                  {checked && <Check className="size-3" />}
                </span>
                <span className={cn("flex-1 text-sm leading-relaxed", checked && "line-through text-muted-foreground")}>
                  {rec}
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
