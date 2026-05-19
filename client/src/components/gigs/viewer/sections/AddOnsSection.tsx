import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, type GigAddOn, type GigCurrency } from "@/types/gigs";
import { CopyButton } from "../../CopyButton";

interface Props {
  addOns: GigAddOn[];
  currency: GigCurrency;
}

export function AddOnsSection({ addOns, currency }: Props) {
  if (!addOns?.length) return null;
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Add-on services</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {addOns.map((a, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{a.name}</p>
                <CopyButton value={`${a.name} — ${formatPrice(a.price, currency)}\n${a.description}`} />
              </div>
              <p className="text-xs text-muted-foreground">{a.description}</p>
              <p className="text-sm font-medium">{formatPrice(a.price, currency)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
