import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useImproveGigSection, usePatchGig } from "@/lib/gigs.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import type { Gig, ImproveSection } from "@/types/gigs";
import { CopyButton } from "../CopyButton";

interface Props {
  gig: Gig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SECTION_OPTIONS: { value: ImproveSection; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "description", label: "Description" },
  { value: "packages", label: "Packages" },
  { value: "faqs", label: "FAQs" },
  { value: "outreach", label: "Outreach (cold email)" },
];

function currentValue(gig: Gig, section: ImproveSection): string {
  const core = gig.content.gig;
  switch (section) {
    case "title":
      return core?.title || "";
    case "description":
      return core?.description || "";
    case "packages":
      if (!core?.packages) return "";
      return ["basic", "standard", "premium"]
        .map((k) => {
          const p = core.packages[k as "basic" | "standard" | "premium"];
          return `${k.toUpperCase()} — ${p.name}\nDeliverables:\n${p.deliverables.map((d) => `• ${d}`).join("\n")}`;
        })
        .join("\n\n");
    case "faqs":
      if (!core?.faqs?.length) return "";
      return core.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
    case "outreach":
      if (!gig.content.outreach) return "";
      return `Subject: ${gig.content.outreach.coldEmail.subject}\n\n${gig.content.outreach.coldEmail.body}`;
  }
}

function canAutoApply(section: ImproveSection): boolean {
  return section === "title" || section === "description";
}

export function ImproveSectionDialog({ gig, open, onOpenChange }: Props) {
  const [section, setSection] = useState<ImproveSection>("title");
  const [instructions, setInstructions] = useState("");
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const improve = useImproveGigSection(gig._id);
  const patch = usePatchGig(gig._id);

  useEffect(() => {
    if (!open) {
      setSuggestion(null);
      setInstructions("");
      setSection("title");
    }
  }, [open]);

  const runImprove = async () => {
    try {
      const result = await improve.mutateAsync({
        section,
        instructions: instructions.trim() || undefined,
      });
      setSuggestion(result.suggestion);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't generate improvement"));
    }
  };

  const accept = async () => {
    if (!suggestion) return;
    const core = gig.content.gig;
    const text = suggestion.trim();
    try {
      if (section === "title") {
        await patch.mutateAsync({
          title: text,
          content: { gig: core ? { ...core, title: text } : null },
        });
        toast.success("Title updated");
      } else if (section === "description") {
        await patch.mutateAsync({
          content: { gig: core ? { ...core, description: text } : null },
        });
        toast.success("Description updated");
      } else {
        toast.message("Suggestion ready — apply manually", {
          description: "Auto-apply isn't supported for this section yet. Copy the suggestion and edit.",
        });
        return;
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't apply suggestion"));
    }
  };

  const original = currentValue(gig, section);
  const autoApply = canAutoApply(section);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:!w-[min(96vw,52rem)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Improve a section
          </DialogTitle>
          <DialogDescription>
            Pick a section and (optionally) describe what to change. Uses 1 credit per generation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <div>
              <Label htmlFor="improve-section" className="mb-1.5 block">Section</Label>
              <Select
                id="improve-section"
                value={section}
                onChange={(e) => {
                  setSection(e.target.value as ImproveSection);
                  setSuggestion(null);
                }}
              >
                {SECTION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="improve-instructions" className="mb-1.5 block">
                Instructions <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="improve-instructions"
                placeholder="e.g. Make it shorter and punchier, lead with the outcome."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={() => void runImprove()} disabled={improve.isPending}>
              {improve.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Generating…
                </>
              ) : suggestion ? (
                <>
                  <RefreshCw className="size-4" /> Regenerate
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generate
                </>
              )}
            </Button>
          </div>

          {suggestion && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="mb-1.5 text-[11px] font-semibold uppercase text-muted-foreground">Current</p>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs">
                  {original || "(empty)"}
                </pre>
              </div>
              <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase text-primary">Suggested</p>
                  <CopyButton value={suggestion} ariaLabel="Copy suggestion" />
                </div>
                <div className="prose prose-sm max-h-72 max-w-none overflow-auto text-xs">
                  <ReactMarkdown>{suggestion}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {suggestion && !autoApply && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              Auto-apply isn't supported for {section} yet. Copy the suggestion and edit the section manually,
              or use Regenerate to fully recreate the gig.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setSuggestion(null)} disabled={!suggestion}>
            Reject
          </Button>
          <Button
            type="button"
            onClick={() => void accept()}
            disabled={!suggestion || patch.isPending || !autoApply}
          >
            {patch.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Applying…
              </>
            ) : (
              "Accept"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
