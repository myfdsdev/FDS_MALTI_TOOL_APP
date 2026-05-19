import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy as CopyIcon,
  Loader2,
  RefreshCw,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useDeleteGig,
  useDuplicateGig,
  usePatchGig,
  useRegenerateGig,
} from "@/lib/gigs.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Gig } from "@/types/gigs";
import { PlatformBadge } from "../PlatformBadge";
import { GigStatusPill } from "../GigStatusPill";
import { GigShareDialog } from "../GigShareDialog";
import { GigExportMenu } from "../GigExportMenu";

interface Props {
  gig: Gig;
  onOpenImprove: () => void;
}

export function GigHeader({ gig, onOpenImprove }: Props) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(gig.title);
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const patch = usePatchGig(gig._id);
  const regenerate = useRegenerateGig();
  const duplicate = useDuplicateGig();
  const del = useDeleteGig();
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setTitle(gig.title);
  }, [gig.title]);

  const saveTitle = (next: string) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const trimmed = next.trim();
      if (!trimmed || trimmed === gig.title) return;
      patch.mutate({ title: trimmed });
    }, 600);
  };

  const onRegenerate = async () => {
    try {
      await regenerate.mutateAsync(gig._id);
      toast.success("Regenerating…");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't regenerate"));
    }
  };

  const onDuplicate = async () => {
    try {
      const result = await duplicate.mutateAsync(gig._id);
      toast.success("Duplicated — regenerating");
      navigate(`/gigs/${result.gigId}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't duplicate"));
    }
  };

  const onDelete = async () => {
    try {
      await del.mutateAsync(gig._id);
      toast.success("Deleted");
      navigate("/gigs");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't delete"));
    }
  };

  const canRegenerate =
    gig.status === "completed" || gig.status === "failed" || gig.status === "partial";

  return (
    <>
      <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/gigs"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> All gigs
          </Link>

          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <PlatformBadge platform={gig.input.platform} />
                <GigStatusPill status={gig.status} />
                {patch.isPending && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" /> Saving…
                  </span>
                )}
              </div>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  saveTitle(e.target.value);
                }}
                className={cn(
                  "mt-2 w-full bg-transparent text-xl font-semibold tracking-tight outline-none",
                  "rounded-md px-1 py-1 hover:bg-accent/50 focus:bg-accent/50",
                )}
                aria-label="Edit title"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setShareOpen(true)}>
                <Share2 className="size-3.5" /> Share
              </Button>
              <GigExportMenu
                gigId={gig._id}
                title={gig.title}
                disabled={gig.status !== "completed" && gig.status !== "partial"}
              />
              <Button type="button" size="sm" variant="outline" onClick={onOpenImprove}>
                <Sparkles className="size-3.5" /> Improve
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!canRegenerate || regenerate.isPending}
                onClick={() => void onRegenerate()}
              >
                {regenerate.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                Regenerate
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void onDuplicate()}
                disabled={duplicate.isPending}
              >
                <CopyIcon className="size-3.5" /> Duplicate
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setConfirmDelete(true)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <GigShareDialog
        gigId={gig._id}
        open={shareOpen}
        onOpenChange={setShareOpen}
        initialEnabled={gig.share.enabled}
        initialSlug={gig.share.slug}
        viewCount={gig.share.viewCount}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm space-y-3 rounded-xl border border-border bg-card p-4 shadow-2xl">
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
                onClick={() => void onDelete()}
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50"
              >
                {del.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
