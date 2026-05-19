import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GigInput } from "@/types/gigs";
import { DELIVERY_TIME_OPTIONS } from "../platformOptions";
import { cn } from "@/lib/utils";

interface Props {
  form: UseFormReturn<GigInput>;
}

export function Step3Delivery({ form }: Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const deliveryTime = watch("deliveryTime") || "";
  const [custom, setCustom] = useState(!DELIVERY_TIME_OPTIONS.includes(deliveryTime) && Boolean(deliveryTime));

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="toolsUsed" className="mb-1.5 block">
          Tools / stack you use
        </Label>
        <Input
          id="toolsUsed"
          placeholder="e.g. Figma, Illustrator, Webflow"
          {...register("toolsUsed", { required: "Tools are required" })}
        />
        {errors.toolsUsed && (
          <p className="mt-1 text-xs text-destructive">{errors.toolsUsed.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="deliveryFormat" className="mb-1.5 block">
          Delivery format
        </Label>
        <Input
          id="deliveryFormat"
          placeholder="e.g. PDF brand guide, Figma file, .svg/.png assets"
          {...register("deliveryFormat", { required: "Delivery format is required" })}
        />
        {errors.deliveryFormat && (
          <p className="mt-1 text-xs text-destructive">{errors.deliveryFormat.message}</p>
        )}
      </div>

      <div>
        <Label className="mb-2 block">Typical delivery time</Label>
        {!custom ? (
          <div className="flex flex-wrap gap-2">
            {DELIVERY_TIME_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setValue("deliveryTime", opt, { shouldValidate: true })}
                className={cn(
                  "rounded-full border border-border bg-card px-3 py-1 text-xs transition-colors hover:bg-accent",
                  deliveryTime === opt && "border-primary bg-primary/5 text-foreground",
                )}
              >
                {opt}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setCustom(true);
                setValue("deliveryTime", "");
              }}
              className="rounded-full border border-dashed border-border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              Custom…
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              placeholder="e.g. 10 business days"
              {...register("deliveryTime", { required: "Required" })}
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setCustom(false);
                setValue("deliveryTime", "");
              }}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-accent"
            >
              Presets
            </button>
          </div>
        )}
        {errors.deliveryTime && (
          <p className="mt-1 text-xs text-destructive">{errors.deliveryTime.message}</p>
        )}
      </div>
    </div>
  );
}
