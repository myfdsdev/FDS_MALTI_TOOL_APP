import { Link, useParams } from "react-router-dom";
import { AlertCircle, Briefcase, Loader2 } from "lucide-react";
import { usePublicGig } from "@/lib/gigs.queries";
import { GigViewer } from "@/components/gigs/viewer/GigViewer";
import type { Gig } from "@/types/gigs";

export default function PublicGig() {
  const { slug } = useParams<{ slug: string }>();
  const { data: publicGig, isLoading, isError } = usePublicGig(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading gig…
        </div>
      </div>
    );
  }

  if (isError || !publicGig) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40 px-4 text-center">
        <AlertCircle className="size-10 text-destructive" />
        <p className="text-lg font-semibold">Gig not found</p>
        <p className="max-w-md text-sm text-muted-foreground">
          This link may have been disabled or never existed.
        </p>
        <Link to="/" className="text-sm font-medium text-primary hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  // Shape into a Gig-ish object for the viewer (read-only mode).
  const viewerGig: Gig = {
    _id: "public",
    user: "",
    input: publicGig.input,
    content: publicGig.content,
    score: publicGig.score,
    status: publicGig.status,
    generationStages: {
      gig: { status: publicGig.content.gig ? "done" : "failed" },
      leads: { status: "done" },
      outreach: { status: publicGig.content.outreach ? "done" : "failed" },
    },
    title: publicGig.title,
    archived: false,
    share: { enabled: true, slug: slug ?? null, viewCount: publicGig.share.viewCount },
    createdAt: publicGig.createdAt,
    updatedAt: publicGig.createdAt,
    generationMs: null,
    generatedBy: null,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Briefcase className="size-4 text-primary" />
            <p className="truncate text-sm font-semibold">{publicGig.title}</p>
          </div>
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Built with Multi-Tool AI SaaS — Create yours free
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 md:px-8">
        <GigViewer gig={viewerGig} readOnly />
      </main>
    </div>
  );
}
