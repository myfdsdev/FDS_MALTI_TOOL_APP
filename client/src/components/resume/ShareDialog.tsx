import { useEffect, useState } from "react";
import { Copy, ExternalLink, Loader2, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateShare } from "@/lib/resume.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  resumeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEnabled: boolean;
  initialSlug: string | null;
  viewCount: number;
}

function publicUrlFor(slug: string | null): string | null {
  if (!slug) return null;
  return `${window.location.origin}/r/${slug}`;
}

export function ShareDialog({
  resumeId,
  open,
  onOpenChange,
  initialEnabled,
  initialSlug,
  viewCount,
}: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [slug, setSlug] = useState<string | null>(initialSlug);
  const update = useUpdateShare(resumeId);

  useEffect(() => {
    setEnabled(initialEnabled);
    setSlug(initialSlug);
  }, [initialEnabled, initialSlug, open]);

  const url = publicUrlFor(slug);

  const toggle = async (next: boolean) => {
    setEnabled(next);
    try {
      const result = await update.mutateAsync(next);
      setSlug(result.slug);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't update share settings"));
      setEnabled(!next);
    }
  };

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="size-4" /> Share your resume
          </DialogTitle>
          <DialogDescription>
            Anyone with this link can view your resume. Disable anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-3">
            <div>
              <p className="text-sm font-medium">Enable public link</p>
              <p className="text-xs text-muted-foreground">
                {enabled ? `${viewCount} view${viewCount === 1 ? "" : "s"} so far.` : "Currently disabled."}
              </p>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => void toggle(e.target.checked)}
              disabled={update.isPending}
            />
          </label>

          {enabled && url && (
            <div className="space-y-2">
              <Input value={url} readOnly />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
                  <Copy className="size-3.5" /> Copy
                </Button>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-medium hover:bg-accent"
                >
                  <ExternalLink className="size-3.5" /> Open
                </a>
              </div>
            </div>
          )}

          {update.isPending && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Updating share settings…
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
