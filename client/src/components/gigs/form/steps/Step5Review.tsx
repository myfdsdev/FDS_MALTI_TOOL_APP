import type { UseFormReturn } from "react-hook-form";
import { Pencil } from "lucide-react";
import type { GigInput } from "@/types/gigs";
import { formatPrice, PLATFORM_LABEL } from "@/types/gigs";

interface Props {
  form: UseFormReturn<GigInput>;
  onEdit: (step: number) => void;
}

export function Step5Review({ form, onEdit }: Props) {
  const v = form.getValues();
  return (
    <div className="space-y-4">
      <ReviewBlock title="Service & platform" onEdit={() => onEdit(0)}>
        <Row label="Service" value={v.serviceName} />
        <Row label="Platform" value={PLATFORM_LABEL[v.platform]} />
        {v.category && <Row label="Category" value={v.category} />}
      </ReviewBlock>

      <ReviewBlock title="Audience & problem" onEdit={() => onEdit(1)}>
        <Row label="Audience" value={v.targetAudience} />
        <Row label="Niche" value={v.niche} />
        <Row label="Problem" value={v.problemSolved} />
        <Row label="Result" value={v.buyerResult} />
      </ReviewBlock>

      <ReviewBlock title="Delivery" onEdit={() => onEdit(2)}>
        <Row label="Tools" value={v.toolsUsed} />
        <Row label="Format" value={v.deliveryFormat} />
        <Row label="Delivery time" value={v.deliveryTime} />
      </ReviewBlock>

      <ReviewBlock title="Pricing & style" onEdit={() => onEdit(3)}>
        <Row
          label="Price range"
          value={`${formatPrice(v.pricingMin, v.pricingCurrency)} – ${formatPrice(v.pricingMax, v.pricingCurrency)}`}
        />
        <Row label="Experience" value={v.experienceLevel} />
        <Row label="Tone" value={v.preferredTone} />
      </ReviewBlock>
    </div>
  );
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-accent"
        >
          <Pencil className="size-3" /> Edit
        </button>
      </div>
      <dl className="space-y-1.5 text-xs">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value || "—"}</dd>
    </div>
  );
}
