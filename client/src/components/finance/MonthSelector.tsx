import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentMonthKey, formatMonthLabel, shiftMonth } from "@/types/finance";

interface Props {
  month: string;
  onChange: (month: string) => void;
}

export function MonthSelector({ month, onChange }: Props) {
  const current = currentMonthKey();
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-1 py-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange(shiftMonth(month, -1))}
        aria-label="Previous month"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <div className="min-w-[10rem] px-2 text-center text-sm font-medium tabular-nums">
        {formatMonthLabel(month)}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onChange(shiftMonth(month, 1))}
        aria-label="Next month"
      >
        <ChevronRight className="size-4" />
      </Button>
      {month !== current && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(current)}
          aria-label="Jump to current month"
          title="Jump to current month"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
