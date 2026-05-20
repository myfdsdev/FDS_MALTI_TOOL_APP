import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TypewriterLoader } from "@/components/common/TypewriterLoader";
import { cn } from "@/lib/utils";
import type { GigGenerationStages, StageStatus } from "@/types/gigs";

const STAGE_LABEL: Record<keyof GigGenerationStages, string> = {
  gig: "Crafting your gig",
  leads: "Legacy stage",
  outreach: "Writing outreach messages",
};

const TIPS = [
  "Specific niches convert 2-3x better than generic ones.",
  "A great thumbnail can lift CTR by 40%.",
  "Premium packages should be 3-5x the basic price.",
  "Strong outreach often closes more than perfect SEO.",
  "FAQs reduce buyer-side back-and-forth and friction.",
  "Most top-rated sellers refresh tags every 30-60 days.",
];

interface Props {
  stages: GigGenerationStages;
}

function StageIcon({ status }: { status: StageStatus }) {
  if (status === "done") return <CheckCircle2 className="size-4 text-emerald-600" />;
  if (status === "running") return <Loader2 className="size-4 animate-spin text-sky-600" />;
  if (status === "failed") return <XCircle className="size-4 text-destructive" />;
  return <Circle className="size-4 text-muted-foreground" />;
}

function statusLabel(status: StageStatus): string {
  switch (status) {
    case "done":
      return "Done";
    case "running":
      return "Working…";
    case "failed":
      return "Failed";
    default:
      return "Waiting";
  }
}

export function GenerationProgressView({ stages }: Props) {
  const reducedMotion = useReducedMotion();
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, []);

  const order: (keyof GigGenerationStages)[] = ["gig", "outreach"];

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-12 text-center">
      <div className="flex h-20 w-full items-center justify-center">
        <TypewriterLoader />
      </div>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Crafting your gig</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Our AI is generating your gig copy, packages, FAQs, thumbnail ideas, portfolio ideas, and
        outreach messages. This usually takes about 30 seconds.
      </p>

      <Card className="mt-8 w-full text-left">
        <CardContent className="space-y-3 p-4">
          {order.map((key) => {
            const stage = stages[key];
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2",
                  stage.status === "running" && "ring-1 ring-sky-200",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <StageIcon status={stage.status} />
                  <p className="truncate text-sm font-medium">{STAGE_LABEL[key]}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-medium",
                    stage.status === "done" && "bg-emerald-100 text-emerald-700",
                    stage.status === "running" && "bg-sky-100 text-sky-700",
                    stage.status === "failed" && "bg-red-100 text-red-700",
                    stage.status === "pending" && "bg-muted text-muted-foreground",
                  )}
                >
                  {statusLabel(stage.status)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <motion.p
        key={tipIndex}
        initial={reducedMotion ? undefined : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 text-xs text-muted-foreground"
      >
        Tip: {TIPS[tipIndex]}
      </motion.p>

      <Link
        to="/gigs"
        className="mt-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to gigs
      </Link>
    </div>
  );
}
