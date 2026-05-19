import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "../../CopyButton";
import type { LeadStrategy } from "@/types/gigs";

interface Props {
  strategy: LeadStrategy;
}

type SearchEngine = "google" | "instagram" | "linkedin" | "maps";

const ENGINE_LABEL: Record<SearchEngine, string> = {
  google: "Search in Google",
  instagram: "Open Instagram",
  linkedin: "Search in LinkedIn",
  maps: "Search in Maps",
};

function buildSearchUrl(engine: SearchEngine, term: string): string {
  const q = encodeURIComponent(term);
  switch (engine) {
    case "google":
      return `https://www.google.com/search?q=${q}`;
    case "instagram":
      return `https://www.instagram.com/explore/tags/${encodeURIComponent(term.replace(/[^a-z0-9]/gi, "").toLowerCase())}/`;
    case "linkedin":
      return `https://www.linkedin.com/search/results/all/?keywords=${q}`;
    case "maps":
      return `https://www.google.com/maps/search/${q}`;
  }
}

function QueryList({
  title,
  items,
  engine,
}: {
  title: string;
  items: string[];
  engine: SearchEngine;
}) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
        <CopyButton value={items.join("\n")} label="Copy all" ariaLabel={`Copy all ${title}`} />
      </div>
      <ul className="space-y-1.5">
        {items.map((q, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2"
          >
            <span className="truncate text-xs">{q}</span>
            <div className="flex shrink-0 items-center gap-1">
              <CopyButton value={q} ariaLabel="Copy query" />
              <a
                href={buildSearchUrl(engine, q)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-card px-2 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label={ENGINE_LABEL[engine]}
              >
                <ExternalLink className="size-3" />
                Search
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LeadStrategySection({ strategy }: Props) {
  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Lead strategy</h2>

        {strategy.bestLeadTypes?.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Best lead types
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {strategy.bestLeadTypes.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {strategy.targetIndustries?.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Target industries
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {strategy.targetIndustries.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs text-sky-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <QueryList title="Google search queries" items={strategy.googleQueries} engine="google" />
        <QueryList title="Instagram search terms" items={strategy.instagramSearchTerms} engine="instagram" />
        <QueryList title="LinkedIn search terms" items={strategy.linkedinSearchTerms} engine="linkedin" />
        <QueryList title="Google Maps search terms" items={strategy.googleMapsSearchTerms} engine="maps" />

        {strategy.manualStrategy && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Manual outreach strategy
              </h3>
              <CopyButton value={strategy.manualStrategy} ariaLabel="Copy manual strategy" />
            </div>
            <p className="whitespace-pre-wrap rounded-md border border-border bg-background p-3 text-sm">
              {strategy.manualStrategy}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
