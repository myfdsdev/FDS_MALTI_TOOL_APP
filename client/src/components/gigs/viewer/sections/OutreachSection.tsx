import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cleanText, cn } from "@/lib/utils";
import { CopyButton } from "../../CopyButton";
import type { OutreachMessages } from "@/types/gigs";

interface Props {
  outreach: OutreachMessages;
}

type TabKey = "email" | "instagram" | "linkedin" | "pitch" | "followup" | "proposal";

const TABS: { key: TabKey; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "instagram", label: "Instagram DM" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "pitch", label: "Short pitch" },
  { key: "followup", label: "Follow-up" },
  { key: "proposal", label: "Proposal" },
];

export function OutreachSection({ outreach }: Props) {
  const [tab, setTab] = useState<TabKey>("email");

  const renderTab = () => {
    switch (tab) {
      case "email":
        return (
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Subject</p>
                <CopyButton value={cleanText(outreach.coldEmail.subject)} ariaLabel="Copy email subject" />
              </div>
              <p className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium">
                {cleanText(outreach.coldEmail.subject)}
              </p>
            </div>
            <MessageBlock label="Body" value={outreach.coldEmail.body} />
          </div>
        );
      case "instagram":
        return <MessageBlock label="Instagram DM" value={outreach.instagramDm} />;
      case "linkedin":
        return <MessageBlock label="LinkedIn message" value={outreach.linkedinMessage} />;
      case "pitch":
        return <MessageBlock label="Short pitch" value={outreach.shortPitch} />;
      case "followup":
        return <MessageBlock label="Follow-up message" value={outreach.followUpMessage} />;
      case "proposal":
        return <MessageBlock label="Proposal message" value={outreach.proposalMessage} />;
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Outreach messages</h2>

        <div
          role="tablist"
          aria-label="Outreach message types"
          className="mt-3 flex flex-wrap gap-1 border-b border-border"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-t-md border-b-2 px-3 py-2 text-xs font-medium transition-colors",
                tab === t.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4">{renderTab()}</div>
      </CardContent>
    </Card>
  );
}

function MessageBlock({ label, value }: { label: string; value: string }) {
  const text = cleanText(value);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</p>
        <CopyButton value={text} ariaLabel={`Copy ${label}`} />
      </div>
      <pre className="whitespace-pre-wrap break-words rounded-md border border-border bg-background px-3 py-2 text-sm font-sans">
        {text}
      </pre>
    </div>
  );
}
