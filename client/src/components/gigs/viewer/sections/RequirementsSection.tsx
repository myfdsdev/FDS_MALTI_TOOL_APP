import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "../../CopyButton";

interface Props {
  requirements: string[];
}

export function RequirementsSection({ requirements }: Props) {
  if (!requirements?.length) return null;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Buyer requirements
          </h2>
          <CopyButton
            value={requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}
            label="Copy all"
          />
        </div>
        <ol className="mt-3 space-y-2 text-sm">
          {requirements.map((r, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                {idx + 1}
              </span>
              <span>{r}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
