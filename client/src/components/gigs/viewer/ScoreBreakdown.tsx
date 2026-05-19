import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SCORE_DIM_LABEL, type GigScore, type GigScoreBreakdown } from "@/types/gigs";

interface Props {
  score: GigScore;
}

function scoreColor(value: number): string {
  if (value >= 75) return "#10b981";
  if (value >= 50) return "#f59e0b";
  return "#ef4444";
}

export function ScoreBreakdown({ score }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left hover:bg-accent"
      >
        <ScoreRing value={score.overall} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Overall score</p>
          <p className="text-xs text-muted-foreground">
            Click to see the breakdown across {Object.keys(score.breakdown).length} dimensions.
          </p>
        </div>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-2">
              {(Object.keys(score.breakdown) as (keyof GigScoreBreakdown)[]).map((key) => (
                <DimBar key={key} label={SCORE_DIM_LABEL[key]} value={score.breakdown[key] ?? 0} />
              ))}
            </div>

            {score.suggestions?.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Lightbulb className="size-3.5" /> Suggestions
                </p>
                <ul className="space-y-1.5 text-sm">
                  {score.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DimBar({ label, value }: { label: string; value: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: reducedMotion ? `${value}%` : 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: scoreColor(value) }}
        />
      </div>
    </div>
  );
}

export function ScoreRing({ value }: { value: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const color = scoreColor(value);
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? value : 0);
  const startRef = useRef<number | null>(null);
  const targetRef = useRef(value);

  useEffect(() => {
    targetRef.current = value;
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const duration = 800;
    const initial = display;
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(initial + (value - initial) * eased));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(raf);
      startRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reducedMotion]);

  const offset = circumference - (display / 100) * circumference;
  return (
    <svg viewBox="0 0 64 64" className="size-14" aria-label={`Overall score ${value}`}>
      <circle cx="32" cy="32" r={radius} stroke="#e5e7eb" strokeWidth="6" fill="none" />
      <circle
        cx="32"
        cy="32"
        r={radius}
        stroke={color}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 32 32)"
      />
      <text x="50%" y="55%" textAnchor="middle" fontSize="16" fontWeight="700" fill="currentColor">
        {display}
      </text>
    </svg>
  );
}
