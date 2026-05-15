import { useState } from "react";
import { AlertCircle, Copy, ExternalLink, Globe } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { LinkPreview } from "@/types/business";

export function LinkPreviewCard({
  preview,
  isLoading = false,
  error,
}: {
  preview?: LinkPreview | null;
  isLoading?: boolean;
  error?: string;
}) {
  const [faviconFailed, setFaviconFailed] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="aspect-video animate-pulse rounded-lg bg-muted" />
        <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-muted" />
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 text-destructive" />
          <div>
            <p className="font-semibold">Preview unavailable</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <p className="mt-2 text-xs text-muted-foreground">Try a different URL.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!preview) return null;

  const hostname = new URL(preview.url).hostname.replace(/^www\./, "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-0.5"
    >
      {preview.image && (
        <img
          src={preview.image}
          alt={preview.title}
          className="aspect-video w-full object-cover"
          loading="lazy"
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-lg font-semibold">{preview.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {preview.siteName} · {hostname}
            </p>
          </div>
          {preview.favicon && !faviconFailed ? (
            <img
              src={preview.favicon}
              alt=""
              className="size-5 rounded-sm"
              onError={() => setFaviconFailed(true)}
            />
          ) : (
            <Globe className="size-5 text-muted-foreground" />
          )}
        </div>

        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
          {preview.description || "No description available for this page."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <ExternalLink className="size-4" />
            Open link
          </a>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(preview.url);
              toast.success("URL copied");
            }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent"
          >
            <Copy className="size-4" />
            Copy URL
          </button>
        </div>
      </div>
    </motion.div>
  );
}
