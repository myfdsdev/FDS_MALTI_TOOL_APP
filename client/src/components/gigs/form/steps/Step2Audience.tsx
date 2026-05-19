import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GigInput } from "@/types/gigs";

interface Props {
  form: UseFormReturn<GigInput>;
}

export function Step2Audience({ form }: Props) {
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const problemSolved = watch("problemSolved") || "";
  const buyerResult = watch("buyerResult") || "";

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="targetAudience" className="mb-1.5 block">
          Target audience
        </Label>
        <Input
          id="targetAudience"
          placeholder="e.g. SaaS founders launching their first product"
          {...register("targetAudience", { required: "Target audience is required" })}
        />
        {errors.targetAudience && (
          <p className="mt-1 text-xs text-destructive">{errors.targetAudience.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="niche" className="mb-1.5 block">
          Niche
        </Label>
        <Input
          id="niche"
          placeholder="e.g. B2B SaaS branding for early-stage startups"
          {...register("niche", { required: "Niche is required" })}
        />
        {errors.niche && <p className="mt-1 text-xs text-destructive">{errors.niche.message}</p>}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="problemSolved">Problem you solve</Label>
          <span className="text-[11px] text-muted-foreground">{problemSolved.length}/300</span>
        </div>
        <Textarea
          id="problemSolved"
          placeholder="What pain point or frustration does your service fix?"
          maxLength={300}
          {...register("problemSolved", { required: "Required", maxLength: 300 })}
        />
        {errors.problemSolved && (
          <p className="mt-1 text-xs text-destructive">{errors.problemSolved.message}</p>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="buyerResult">Buyer's end result</Label>
          <span className="text-[11px] text-muted-foreground">{buyerResult.length}/300</span>
        </div>
        <Textarea
          id="buyerResult"
          placeholder="What does the buyer walk away with? Concrete outcome."
          maxLength={300}
          {...register("buyerResult", { required: "Required", maxLength: 300 })}
        />
        {errors.buyerResult && (
          <p className="mt-1 text-xs text-destructive">{errors.buyerResult.message}</p>
        )}
      </div>
    </div>
  );
}
