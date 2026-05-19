import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "../../CopyButton";

interface Props {
  description: string;
}

export function DescriptionSection({ description }: Props) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Description</h2>
          <CopyButton value={description} label="Copy" successMessage="Description copied" />
        </div>
        <div className="prose prose-sm mt-3 max-w-none text-sm leading-relaxed text-foreground prose-headings:font-semibold prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
