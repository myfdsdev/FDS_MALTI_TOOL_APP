import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "../../CopyButton";

interface Props {
  concept: string;
  prompt: string;
}

export function ThumbnailSection({ concept, prompt }: Props) {
  if (!concept && !prompt) return null;
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Thumbnail</h2>

        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Concept</p>
              {concept && <CopyButton value={concept} ariaLabel="Copy concept" />}
            </div>
            <div className="flex h-32 items-center justify-center rounded-md bg-muted/40">
              <ImageIcon className="size-8 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm leading-relaxed">{concept}</p>
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase text-muted-foreground">AI prompt</p>
              <div className="flex items-center gap-1">
                {prompt && <CopyButton value={prompt} ariaLabel="Copy prompt" />}
                <a
                  href="https://www.midjourney.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <ExternalLink className="size-3" /> Midjourney
                </a>
              </div>
            </div>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md bg-muted/50 p-3 text-xs">
              {prompt}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
