import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GigCurrency, GigInput } from "@/types/gigs";
import { CURRENCY_OPTIONS, EXPERIENCE_OPTIONS, TONE_OPTIONS } from "../platformOptions";
import { cn } from "@/lib/utils";

interface Props {
  form: UseFormReturn<GigInput>;
}

export function Step4Pricing({ form }: Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const currency = watch("pricingCurrency");
  const experience = watch("experienceLevel");
  const tone = watch("preferredTone");

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-2 block">Pricing range</Label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="mb-1 block text-[11px] text-muted-foreground">Min</span>
            <Input
              type="number"
              min={1}
              placeholder="50"
              {...register("pricingMin", {
                required: "Required",
                valueAsNumber: true,
                min: { value: 1, message: "Min 1" },
              })}
            />
          </div>
          <div>
            <span className="mb-1 block text-[11px] text-muted-foreground">Max</span>
            <Input
              type="number"
              min={1}
              placeholder="500"
              {...register("pricingMax", {
                required: "Required",
                valueAsNumber: true,
                min: { value: 1, message: "Min 1" },
                validate: (v, all) =>
                  Number(v) >= Number(all.pricingMin) || "Max must be ≥ min",
              })}
            />
          </div>
          <div>
            <span className="mb-1 block text-[11px] text-muted-foreground">Currency</span>
            <div className="flex flex-wrap gap-1">
              {CURRENCY_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setValue("pricingCurrency", c.value as GigCurrency, { shouldValidate: true })}
                  className={cn(
                    "rounded-md border border-border bg-card px-2 py-1 text-[11px] hover:bg-accent",
                    currency === c.value && "border-primary bg-primary/5",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {(errors.pricingMin || errors.pricingMax) && (
          <p className="mt-1 text-xs text-destructive">
            {errors.pricingMin?.message || errors.pricingMax?.message}
          </p>
        )}
      </div>

      <div>
        <Label className="mb-2 block">Experience level</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {EXPERIENCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("experienceLevel", opt.value, { shouldValidate: true })}
              className={cn(
                "flex flex-col items-start gap-1 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent",
                experience === opt.value && "border-primary bg-primary/5 ring-1 ring-primary",
              )}
              aria-pressed={experience === opt.value}
            >
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-[11px] text-muted-foreground">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Preferred tone</Label>
        <div className="grid gap-2 sm:grid-cols-4">
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("preferredTone", opt.value, { shouldValidate: true })}
              className={cn(
                "flex flex-col items-start gap-1 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent",
                tone === opt.value && "border-primary bg-primary/5 ring-1 ring-primary",
              )}
              aria-pressed={tone === opt.value}
            >
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-[11px] text-muted-foreground">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
