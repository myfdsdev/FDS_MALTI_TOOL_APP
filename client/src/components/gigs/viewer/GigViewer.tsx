import { useState } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRegenerateGig } from "@/lib/gigs.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import type { Gig } from "@/types/gigs";
import { GigHeader } from "./GigHeader";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { ImproveSectionDialog } from "./ImproveSectionDialog";
import { TitlesSection } from "./sections/TitlesSection";
import { DescriptionSection } from "./sections/DescriptionSection";
import { PackagesSection } from "./sections/PackagesSection";
import { TagsSection } from "./sections/TagsSection";
import { RequirementsSection } from "./sections/RequirementsSection";
import { FAQsSection } from "./sections/FAQsSection";
import { AddOnsSection } from "./sections/AddOnsSection";
import { ThumbnailSection } from "./sections/ThumbnailSection";
import { PortfolioIdeasSection } from "./sections/PortfolioIdeasSection";
import { OutreachSection } from "./sections/OutreachSection";

interface Props {
  gig: Gig;
  readOnly?: boolean;
}

export function GigViewer({ gig, readOnly = false }: Props) {
  const [improveOpen, setImproveOpen] = useState(false);
  const regenerate = useRegenerateGig();
  const core = gig.content.gig;
  const outreach = gig.content.outreach;

  const onRegenerate = async () => {
    try {
      await regenerate.mutateAsync(gig._id);
      toast.success("Regenerating…");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't regenerate"));
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {!readOnly && <GigHeader gig={gig} onOpenImprove={() => setImproveOpen(true)} />}

      <div className="space-y-4">
        {gig.score && (
          <ScoreBreakdown score={gig.score} />
        )}

        {gig.status === "partial" && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
            <AlertTriangle className="size-4 shrink-0" />
            <div className="flex-1 text-xs">
              <p className="font-medium">Some sections failed to generate.</p>
              <p className="mt-0.5 opacity-90">
                {Object.entries(gig.generationStages)
                  .filter(([, v]) => v.status === "failed")
                  .map(([k]) => k)
                  .join(", ") || "Unknown"} — regenerate to retry the full gig.
              </p>
            </div>
            {!readOnly && (
              <Button size="sm" variant="outline" onClick={() => void onRegenerate()} disabled={regenerate.isPending}>
                {regenerate.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                Regenerate
              </Button>
            )}
          </div>
        )}

        {core && (
          <>
            <TitlesSection gig={core} />
            <TagsSection tags={core.tags || []} seoKeywords={core.seoKeywords || []} />
            <DescriptionSection description={core.description} />
            <PackagesSection gig={core} currency={gig.input.pricingCurrency} />
            <RequirementsSection requirements={core.buyerRequirements || []} />
            <FAQsSection faqs={core.faqs || []} />
            <AddOnsSection addOns={core.addOnServices || []} currency={gig.input.pricingCurrency} />
            <ThumbnailSection concept={core.thumbnailConcept} prompt={core.thumbnailPrompt} />
            <PortfolioIdeasSection ideas={core.portfolioSampleIdeas || []} />
          </>
        )}

        {!core && gig.generationStages.gig.status === "failed" && (
          <FailedSection name="Gig content" readOnly={readOnly} onRetry={onRegenerate} pending={regenerate.isPending} />
        )}

        {outreach ? (
          <OutreachSection outreach={outreach} />
        ) : gig.generationStages.outreach.status === "failed" ? (
          <FailedSection name="Outreach" readOnly={readOnly} onRetry={onRegenerate} pending={regenerate.isPending} />
        ) : null}
      </div>

      {!readOnly && (
        <ImproveSectionDialog gig={gig} open={improveOpen} onOpenChange={setImproveOpen} />
      )}
    </div>
  );
}

function FailedSection({
  name,
  readOnly,
  onRetry,
  pending,
}: {
  name: string;
  readOnly: boolean;
  onRetry: () => Promise<void>;
  pending: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="size-4 text-amber-600" />
          <span>
            <span className="font-semibold">{name}</span> failed to generate.
          </span>
        </div>
        {!readOnly && (
          <Button size="sm" variant="outline" onClick={() => void onRetry()} disabled={pending}>
            {pending ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
