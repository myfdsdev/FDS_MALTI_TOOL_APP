import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "../../CopyButton";

interface Props {
  ideas: string[];
}

export function PortfolioIdeasSection({ ideas }: Props) {
  if (!ideas?.length) return null;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Portfolio sample ideas
          </h2>
          <CopyButton value={ideas.map((i, idx) => `${idx + 1}. ${i}`).join("\n")} label="Copy all" />
        </div>
        <ol className="mt-3 space-y-2 text-sm">
          {ideas.map((idea, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-[11px] font-semibold text-amber-700">
                {idx + 1}
              </span>
              <span>{idea}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
