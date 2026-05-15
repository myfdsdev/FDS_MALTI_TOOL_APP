import { cn } from "@/lib/utils";

export function ProgressRing({
  value,
  size = 48,
  strokeWidth = 4,
  className,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const normalized = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-[stroke-dashoffset] duration-300"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute text-xs font-semibold tabular-nums">{normalized}%</span>
    </div>
  );
}
