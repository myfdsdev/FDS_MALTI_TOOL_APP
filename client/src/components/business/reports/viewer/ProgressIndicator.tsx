import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { ReportStage } from "@/types/reports";
import { STAGE_LABEL } from "@/types/reports";

interface Props {
  stage: ReportStage;
}

const STAGE_PROGRESS: Record<ReportStage, number> = {
  queued: 8,
  scraping: 30,
  analyzing: 55,
  generating: 80,
  completed: 100,
  failed: 100,
};

const TIPS = [
  "Detecting site genre…",
  "Estimating revenue potential…",
  "Building monetization strategy…",
  "Drafting the 12 detailed sections…",
  "Ranking the top recommendations…",
];

export function ProgressIndicator({ stage }: Props) {
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 2000);
    return () => clearInterval(id);
  }, []);

  const progress = STAGE_PROGRESS[stage] ?? 10;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Loader2 className="size-7 animate-spin" />
      </div>
      <div>
        <p className="text-lg font-semibold">{STAGE_LABEL[stage]}</p>
        <p className="mt-1 text-sm text-muted-foreground">Usually takes 15–30 seconds.</p>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-primary"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={tipIdx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-muted-foreground"
        >
          {TIPS[tipIdx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
