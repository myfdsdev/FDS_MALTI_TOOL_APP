import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Archive, Copy as CopyIcon, Eye, MoreVertical, Share2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDeleteGig, useDuplicateGig, usePatchGig } from "@/lib/gigs.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { GigListItem } from "@/types/gigs";
import { GigStatusPill } from "./GigStatusPill";
import { PlatformBadge } from "./PlatformBadge";
import { GigShareDialog } from "./GigShareDialog";

interface Props {
  gig: GigListItem;
  reducedMotion: boolean;
}

export function GigCard({ gig, reducedMotion }: Props) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const del = useDeleteGig();
  const dup = useDuplicateGig();
  const patch = usePatchGig(gig._id);

  const handleDelete = async () => {
    try {
      await del.mutateAsync(gig._id);
      toast.success(`Deleted "${gig.title}"`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't delete gig"));
    }
  };

  const handleDuplicate = async () => {
    try {
      const result = await dup.mutateAsync(gig._id);
      toast.success("Duplicated — regenerating");
      navigate(`/gigs/${result.gigId}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't duplicate gig"));
    }
  };

  const handleArchive = async () => {
    try {
      await patch.mutateAsync({ archived: !gig.archived });
      toast.success(gig.archived ? "Restored" : "Archived");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't update gig"));
    }
  };

  const score = gig.score?.overall ?? null;

  return (
    <>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: reducedMotion ? 0 : 8 },
          show: { opacity: 1, y: 0 },
        }}
        className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <PlatformBadge platform={gig.input.platform} />
              <GigStatusPill status={gig.status} />
              {gig.archived && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  Archived
                </span>
              )}
            </div>
            <Link to={`/gigs/${gig._id}`} className="mt-2 block">
              <p className="line-clamp-2 text-sm font-semibold text-foreground hover:underline">
                {gig.title || gig.input.serviceName || "Untitled gig"}
              </p>
            </Link>
            {gig.input.niche && (
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{gig.input.niche}</p>
            )}
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
                  navigate(`/gigs/${gig._id}`);
                }}
                icon={Eye}
                label="View"
              />
              <MenuItem
                onClick={() => {
                  setMenuOpen(false);
                  void handleDuplicate();
                }}
                icon={CopyIcon}
                label="Duplicate"
              />
              <MenuItem
                onClick={() => {
                  setMenuOpen(false);
                  setShareOpen(true);
                }}
                icon={Share2}
                label="Share"
              />
              <MenuItem
                onClick={() => {
                  setMenuOpen(false);
                  void handleArchive();
                }}
                icon={Archive}
                label={gig.archived ? "Restore" : "Archive"}
              />
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

        <div className="mt-auto flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {gig.status === "completed" || gig.status === "partial"
              ? `Generated ${formatDistanceToNow(new Date(gig.updatedAt), { addSuffix: true })}`
              : gig.status === "failed"
                ? "Failed — regenerate to retry"
                : "Generating…"}
          </p>
          {score !== null && <ScoreRing value={score} />}
        </div>

        {confirmDelete && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-card/95 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-lg">
              <p className="text-sm font-medium">Delete this gig?</p>
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

      <GigShareDialog
        gigId={gig._id}
        open={shareOpen}
        onOpenChange={setShareOpen}
        initialEnabled={gig.share.enabled}
        initialSlug={gig.share.slug}
        viewCount={gig.share.viewCount}
      />
    </>
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
        danger ? "text-destructive hover:bg-destructive/10" : "hover:bg-accent",
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
