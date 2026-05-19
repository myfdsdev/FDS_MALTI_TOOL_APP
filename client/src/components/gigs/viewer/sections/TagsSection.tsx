import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "../../CopyButton";

interface Props {
  tags: string[];
  seoKeywords: string[];
}

export function TagsSection({ tags, seoKeywords }: Props) {
  const allTags = tags.join(", ");
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tags</h2>
          {tags.length > 0 && <CopyButton value={allTags} label="Copy all" successMessage="Tags copied" />}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {seoKeywords.length > 0 && (
          <>
            <div className="mt-5 flex items-start justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                SEO keywords
              </h3>
              <CopyButton value={seoKeywords.join(", ")} ariaLabel="Copy SEO keywords" />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {seoKeywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary"
                >
                  {k}
                </span>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
