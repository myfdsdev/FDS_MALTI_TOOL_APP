import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "../../CopyButton";
import type { GigCore } from "@/types/gigs";

interface Props {
  gig: GigCore;
}

export function TitlesSection({ gig }: Props) {
  const alts = gig.alternativeTitles || [];
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Titles</h2>
          <CopyButton value={gig.title} successMessage="Title copied" label="Copy" />
        </div>
        <p className="mt-3 text-xl font-semibold leading-snug">{gig.title}</p>

        {alts.length > 0 && (
          <>
            <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Alternative titles
            </p>
            <ul className="mt-2 space-y-1.5">
              {alts.map((alt, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2"
                >
                  <span className="truncate text-sm">{alt}</span>
                  <CopyButton value={alt} ariaLabel={`Copy alternative title ${idx + 1}`} />
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
