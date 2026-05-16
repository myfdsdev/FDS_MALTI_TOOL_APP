import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles, BarChart3, Target, ListChecks, Layers, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateReport } from "@/lib/reports.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";

const PERKS: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }[] = [
  { icon: Sparkles, title: "Detected genre & audience", body: "We identify the type of site and the buyers most likely to convert." },
  { icon: Target, title: "Primary monetization strategy", body: "One opinionated path with reasoning specific to this site." },
  { icon: Layers, title: "5 revenue streams", body: "Each with setup effort, time to revenue, and potential earnings." },
  { icon: ListChecks, title: "12 detailed sections", body: "From pricing to channels to a 90-day roadmap." },
  { icon: BarChart3, title: "Scores across 4 areas", body: "SEO, conversion, branding, marketing — plus an overall score." },
  { icon: Lightbulb, title: "Top recommendations", body: "Prioritized actions you can ship this week." },
];

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return /^https?:$/i.test(u.protocol);
  } catch {
    return false;
  }
}

export default function NewReportPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const create = useCreateReport();
  const valid = isValidUrl(url.trim());

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      toast.error("Please enter a valid URL (https://example.com)");
      return;
    }
    try {
      const result = await create.mutateAsync(url.trim());
      toast.success("Report queued — analyzing now");
      navigate(`/business/reports/${result.reportId}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't queue report"));
    }
  };

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <button
          type="button"
          onClick={() => navigate("/business/reports")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to reports
        </button>

        <header className="mt-3">
          <h1 className="text-3xl font-semibold tracking-tight">New growth report</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Paste any public URL and we'll fetch the page, detect the site genre, and generate a
            tailored monetization report.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <Label htmlFor="report-url" className="mb-2 block">
              Website URL
            </Label>
            <Input
              id="report-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourdomain.com"
              autoFocus
              type="url"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Paste any public website URL — we'll fetch it and generate a monetization report.
              Private IPs and intranet URLs are blocked.
            </p>

            <Button
              type="submit"
              disabled={!valid || create.isPending}
              className="mt-5 w-full"
            >
              {create.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Queuing…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generate report
                </>
              )}
            </Button>

            <p className="mt-3 text-[11px] text-muted-foreground">
              1 generation counts against your daily AI quota. Typical run time: 15–30 seconds.
            </p>
          </form>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-semibold">What you'll get</p>
              <ul className="mt-4 space-y-3">
                {PERKS.map((perk) => {
                  const Icon = perk.icon;
                  return (
                    <li key={perk.title} className="flex items-start gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{perk.title}</p>
                        <p className="text-xs text-muted-foreground">{perk.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
