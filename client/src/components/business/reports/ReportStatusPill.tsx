import { CheckCircle2, Loader2, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportStatus } from "@/types/reports";

interface Props {
  status: ReportStatus;
  className?: string;
}

const META: Record<ReportStatus, { label: string; icon: React.ComponentType<{ className?: string }>; classes: string }> = {
  queued: { label: "Queued", icon: Clock, classes: "bg-muted text-muted-foreground" },
  processing: { label: "Generating", icon: Loader2, classes: "bg-sky-100 text-sky-700" },
  completed: { label: "Completed", icon: CheckCircle2, classes: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Failed", icon: AlertTriangle, classes: "bg-red-100 text-red-700" },
};

export function ReportStatusPill({ status, className }: Props) {
  const meta = META[status];
  const Icon = meta.icon;
  const spin = status === "processing" || status === "queued";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        meta.classes,
        className
      )}
    >
      <Icon className={cn("size-3", spin && "animate-spin")} />
      {meta.label}
    </span>
  );
}
