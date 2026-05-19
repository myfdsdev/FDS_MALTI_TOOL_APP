import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, type GigCore, type GigCurrency, type GigPackage } from "@/types/gigs";
import { cn } from "@/lib/utils";
import { CopyButton } from "../../CopyButton";

interface Props {
  gig: GigCore;
  currency: GigCurrency;
}

const TIERS: { key: keyof GigCore["packages"]; label: string; popular?: boolean }[] = [
  { key: "basic", label: "Basic" },
  { key: "standard", label: "Standard" },
  { key: "premium", label: "Premium", popular: true },
];

function packageAsText(label: string, p: GigPackage, currency: GigCurrency): string {
  const lines = [
    `${label} — ${p.name}`,
    `${formatPrice(p.price, currency)} · ${p.deliveryDays} days · ${p.revisions} revisions`,
    "",
    "Deliverables:",
    ...p.deliverables.map((d) => `• ${d}`),
  ];
  if (p.addOns?.length) {
    lines.push("", "Add-ons:", ...p.addOns.map((a) => `• ${a}`));
  }
  return lines.join("\n");
}

export function PackagesSection({ gig, currency }: Props) {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Packages</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {TIERS.map((tier) => {
            const pkg = gig.packages[tier.key];
            if (!pkg) return null;
            return (
              <div
                key={tier.key}
                className={cn(
                  "relative flex flex-col rounded-xl border border-border bg-background p-4",
                  tier.popular && "border-primary ring-1 ring-primary",
                )}
              >
                {tier.popular && (
                  <span className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                    <Star className="size-3" /> Most popular
                  </span>
                )}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-medium uppercase text-muted-foreground">{tier.label}</p>
                    <p className="mt-0.5 text-sm font-semibold">{pkg.name}</p>
                  </div>
                  <CopyButton
                    value={packageAsText(tier.label, pkg, currency)}
                    ariaLabel={`Copy ${tier.label} package`}
                  />
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight">
                  {formatPrice(pkg.price, currency)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {pkg.deliveryDays} day{pkg.deliveryDays === 1 ? "" : "s"} · {pkg.revisions} revisions
                </p>
                <ul className="mt-3 space-y-1 text-xs">
                  {pkg.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                {pkg.addOns?.length > 0 && (
                  <>
                    <p className="mt-3 text-[11px] font-medium uppercase text-muted-foreground">Add-ons</p>
                    <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                      {pkg.addOns.map((a, i) => (
                        <li key={i}>• {a}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
