import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, MoreVertical, Share2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDeleteReport } from "@/lib/reports.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { ReportStatusPill } from "./ReportStatusPill";
import { cn } from "@/lib/utils";
import type { ReportListItem } from "@/types/reports";

interface Props {
  report: ReportListItem;
  reducedMotion: boolean;
}

function faviconFor(host: string): string {
  if (!host) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
}

export function ReportCard({ report, reducedMotion }: Props) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const del = useDeleteReport();

  const handleDelete = async () => {
    try {
      await del.mutateAsync(report._id);
      toast.success(`Deleted "${report.hostname}"`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't delete report"));
    }
  };

  const score = report.overallScore;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: reducedMotion ? 0 : 8 },
        show: { opacity: 1, y: 0 },
      }}
      className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
          {report.hostname ? (
            <img
              src={faviconFor(report.hostname)}
              alt=""
              className="size-6"
              onError={(ev) => {
                (ev.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <Link to={`/business/reports/${report._id}`} className="block">
            <p className="truncate text-sm font-semibold text-foreground hover:underline">
              {report.websiteTitle || report.hostname || report.websiteUrl}
            </p>
          </Link>
          <p className="truncate text-xs text-muted-foreground">{report.hostname || report.websiteUrl}</p>
        </div>

        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="More actions"
              className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 focus:opacity-100"
            >
              <MoreVertical className="size-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1">
            <MenuItem
              onClick={() => {
                setMenuOpen(false);
                navigate(`/business/reports/${report._id}`);
              }}
              icon={Eye}
              label="View"
            />
            {report.share.enabled && (
              <MenuItem
                onClick={() => {
                  setMenuOpen(false);
                  navigate(`/business/reports/${report._id}#share`);
                }}
                icon={Share2}
                label="Share link"
              />
            )}
            <MenuItem
              onClick={() => {
                setMenuOpen(false);
                setConfirmDelete(true);
              }}
              icon={Trash2}
              label="Delete"
              danger
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ReportStatusPill status={report.status} />
        {report.detectedGenre && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            {report.detectedGenre}
          </span>
        )}
        {report.share.enabled && (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] text-sky-700">
            <Share2 className="size-3" /> Public
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {report.status === "completed"
            ? `Generated ${formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}`
            : report.status === "failed"
              ? "Failed — re-run to retry"
              : "Generating…"}
        </p>
        {score !== null && score !== undefined && (
          <ScoreRing value={score} />
        )}
      </div>

      {confirmDelete && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-card/95 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-lg">
            <p className="text-sm font-medium">Delete this report?</p>
            <p className="text-xs text-muted-foreground">This can't be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-md px-3 py-1.5 text-xs hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={del.isPending}
                onClick={() => void handleDelete()}
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50"
              >
                {del.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function MenuItem({
  onClick,
  icon: Icon,
  label,
  danger,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
        danger ? "text-destructive hover:bg-destructive/10" : "hover:bg-accent"
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

function ScoreRing({ value }: { value: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 75 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg viewBox="0 0 48 48" className="size-10" aria-label={`Overall score ${value}`}>
      <circle cx="24" cy="24" r={radius} stroke="#e5e7eb" strokeWidth="4" fill="none" />
      <circle
        cx="24"
        cy="24"
        r={radius}
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 24 24)"
      />
      <text x="50%" y="54%" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
        {value}
      </text>
    </svg>
  );
}
