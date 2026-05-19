import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GigForm } from "@/components/gigs/form/GigForm";
import { useCreateGig } from "@/lib/gigs.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import type { GigInput } from "@/types/gigs";

const PERKS = [
  "Tiered packages (Basic / Standard / Premium) with deliverables and pricing",
  "SEO title, 5 alternatives, tags & keywords tailored to your platform",
  "Markdown gig description optimized for conversion",
  "Buyer requirements, FAQs, add-ons, thumbnail concept & AI prompt",
  "Lead strategy: search queries for Google, Maps, IG & LinkedIn",
  "Outreach pack: cold email, IG DM, LinkedIn message, follow-up, proposal",
];

export default function NewGigPage() {
  const navigate = useNavigate();
  const create = useCreateGig();

  const onSubmit = async (input: GigInput) => {
    try {
      const result = await create.mutateAsync(input);
      toast.success("Generating your gig…");
      navigate(`/gigs/${result.gigId}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't queue gig"));
    }
  };

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <button
          type="button"
          onClick={() => navigate("/gigs")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to gigs
        </button>

        <header className="mt-3">
          <h1 className="text-3xl font-semibold tracking-tight">New gig</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Tell us about your service. We'll generate everything you need to publish and start
            landing clients.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <GigForm onSubmit={onSubmit} submitting={create.isPending} />

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <p className="text-sm font-semibold">What you'll get</p>
              </div>
              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
