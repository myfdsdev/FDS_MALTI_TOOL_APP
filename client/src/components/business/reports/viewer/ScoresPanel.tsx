import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ReportScores } from "@/types/reports";

interface Props {
  scores: ReportScores;
}

function useCountUp(target: number, duration = 800, enabled = true): number {
  const [value, setValue] = useState(enabled ? 0 : target);
  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setValue(Math.round(eased * target));
      if (ratio < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);
  return value;
}

export function ScoresPanel({ scores }: Props) {
  const reduced = useReducedMotion();
  const overall = useCountUp(scores.overall, 800, !reduced);
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
      <Ring value={overall} max={100} />
      <div className="flex w-full flex-col gap-2">
        <CategoryBar label="SEO" value={scores.seo} />
        <CategoryBar label="Conversion" value={scores.conversion} />
        <CategoryBar label="Branding" value={scores.branding} />
        <CategoryBar label="Marketing" value={scores.marketing} />
      </div>
    </div>
  );
}

function colorFor(value: number): string {
  if (value >= 75) return "#10b981";
  if (value >= 50) return "#f59e0b";
  return "#ef4444";
}

function Ring({ value, max }: { value: number; max: number }) {
  const radius = 56;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / max) * circumference;
  const color = colorFor(value);
  return (
    <div
      className="relative flex size-36 shrink-0 items-center justify-center"
      role="img"
      aria-label={`Overall score ${value} out of ${max}`}
    >
      <svg viewBox="0 0 140 140" className="size-36 -rotate-90">
        <circle cx="70" cy="70" r={radius} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold tabular-nums" style={{ color }}>
          {value}
        </p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Overall</p>
      </div>
    </div>
  );
}

function CategoryBar({ label, value }: { label: string; value: number }) {
  const color = colorFor(value);
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}/100</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{ backgroundColor: color }}
          className="h-full rounded-full"
        />
      </div>
    </div>
  );
}
