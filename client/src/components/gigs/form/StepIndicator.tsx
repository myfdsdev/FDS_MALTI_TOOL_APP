import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  steps: string[];
  current: number; // 0-based
  maxReached: number;
  onJump: (index: number) => void;
}

export function StepIndicator({ steps, current, maxReached, onJump }: Props) {
  return (
    <ol className="flex w-full items-center gap-1 text-[11px] font-medium text-muted-foreground sm:gap-2">
      {steps.map((label, idx) => {
        const isDone = idx < current || idx <= maxReached - 1;
        const isCurrent = idx === current;
        const isClickable = idx <= maxReached;
        return (
          <li key={label} className="flex flex-1 items-center gap-1 sm:gap-2">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onJump(idx)}
              className={cn(
                "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                isClickable && "hover:bg-accent",
                isCurrent && "bg-accent text-foreground",
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isDone && !isCurrent ? <Check className="size-3" /> : idx + 1}
              </span>
              <span className="hidden truncate sm:inline">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
