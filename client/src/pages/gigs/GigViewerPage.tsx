import { Link, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGig, useRegenerateGig } from "@/lib/gigs.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { GenerationProgressView } from "@/components/gigs/GenerationProgressView";
import { GigViewer } from "@/components/gigs/viewer/GigViewer";

export default function GigViewerPage() {
  const { id } = useParams<{ id: string }>();
  const { data: gig, isLoading, isError } = useGig(id);
  const regenerate = useRegenerateGig();

  const onRetry = async () => {
    if (!id) return;
    try {
      await regenerate.mutateAsync(id);
      toast.success("Regenerating…");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't regenerate"));
    }
  };

  if (isLoading || !gig) {
    if (isError) {
      return (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
          <AlertTriangle className="size-8 text-destructive" />
          <p className="text-lg font-semibold">Gig not found</p>
          <p className="text-sm text-muted-foreground">It may have been deleted.</p>
          <Link to="/gigs" className="text-sm text-primary hover:underline">
            Back to gigs
          </Link>
        </div>
      );
    }
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allFailed =
    gig.status === "failed" ||
    (gig.generationStages.gig.status === "failed" &&
      gig.generationStages.leads.status === "failed" &&
      gig.generationStages.outreach.status === "failed");

  if (gig.status === "queued" || gig.status === "processing") {
    return (
      <div className="px-4 py-8 md:px-8">
        <GenerationProgressView stages={gig.generationStages} />
      </div>
    );
  }

  if (allFailed && !gig.content.gig && !gig.content.leadStrategy && !gig.content.outreach) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 md:px-8">
        <Link
          to="/gigs"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to gigs
        </Link>
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-7" />
            </div>
            <div>
              <p className="text-lg font-semibold">Generation failed</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                We weren't able to generate this gig. You can regenerate to try again — it uses 1 credit.
              </p>
            </div>
            <Button onClick={() => void onRetry()} disabled={regenerate.isPending}>
              {regenerate.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Regenerate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8">
      <GigViewer gig={gig} />
    </div>
  );
}
