import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CopyButton } from "../../CopyButton";
import type { GigFAQ } from "@/types/gigs";

interface Props {
  faqs: GigFAQ[];
}

export function FAQsSection({ faqs }: Props) {
  if (!faqs?.length) return null;
  const allText = faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">FAQs</h2>
          <CopyButton value={allText} label="Copy all" />
        </div>
        <div className="mt-3 divide-y divide-border rounded-lg border border-border bg-background">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} faq={faq} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FAQItem({ faq }: { faq: GigFAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-accent"
      >
        <span>{faq.question}</span>
        <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground">
          {faq.answer}
        </div>
      )}
    </div>
  );
}
