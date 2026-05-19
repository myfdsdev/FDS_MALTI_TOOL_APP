import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { GigInput } from "@/types/gigs";
import { PLATFORM_OPTIONS } from "../platformOptions";

interface Props {
  form: UseFormReturn<GigInput>;
}

export function Step1Service({ form }: Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const platform = watch("platform");
  const selectedPlatform = PLATFORM_OPTIONS.find((p) => p.value === platform);

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="serviceName" className="mb-1.5 block">
          What service are you offering?
        </Label>
        <Input
          id="serviceName"
          placeholder="e.g. Modern logo & brand identity design"
          {...register("serviceName", { required: "Service name is required", minLength: { value: 3, message: "At least 3 characters" } })}
        />
        {errors.serviceName && (
          <p className="mt-1 text-xs text-destructive">{errors.serviceName.message}</p>
        )}
      </div>

      <div>
        <Label className="mb-2 block">Platform</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PLATFORM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setValue("platform", opt.value, { shouldValidate: true })}
              className={cn(
                "flex flex-col items-start gap-1 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-accent",
                platform === opt.value && "border-primary bg-primary/5 ring-1 ring-primary",
              )}
              aria-pressed={platform === opt.value}
            >
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-[11px] text-muted-foreground">{opt.description}</span>
            </button>
          ))}
        </div>
        {errors.platform && <p className="mt-1 text-xs text-destructive">{errors.platform.message}</p>}
      </div>

      <div>
        <Label htmlFor="category" className="mb-1.5 block">
          Category <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="category"
          placeholder={selectedPlatform?.categoryPlaceholder || "e.g. Graphics & Design"}
          {...register("category")}
        />
      </div>
    </div>
  );
}
