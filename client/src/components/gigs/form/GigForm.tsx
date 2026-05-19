import { useState } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GigInput } from "@/types/gigs";
import { StepIndicator } from "./StepIndicator";
import { Step1Service } from "./steps/Step1Service";
import { Step2Audience } from "./steps/Step2Audience";
import { Step3Delivery } from "./steps/Step3Delivery";
import { Step4Pricing } from "./steps/Step4Pricing";
import { Step5Review } from "./steps/Step5Review";

const STEPS = ["Service", "Audience", "Delivery", "Pricing", "Review"];

const FIELDS_PER_STEP: (keyof GigInput)[][] = [
  ["serviceName", "platform"],
  ["targetAudience", "niche", "problemSolved", "buyerResult"],
  ["toolsUsed", "deliveryFormat", "deliveryTime"],
  ["pricingMin", "pricingMax", "pricingCurrency", "experienceLevel", "preferredTone"],
  [],
];

const DEFAULT_VALUES: GigInput = {
  serviceName: "",
  platform: "fiverr",
  category: "",
  targetAudience: "",
  niche: "",
  problemSolved: "",
  buyerResult: "",
  toolsUsed: "",
  deliveryFormat: "",
  experienceLevel: "intermediate",
  preferredTone: "professional",
  pricingMin: 50,
  pricingMax: 500,
  pricingCurrency: "USD",
  deliveryTime: "3 days",
};

interface Props {
  onSubmit: (input: GigInput) => Promise<void>;
  submitting?: boolean;
}

export function GigForm({ onSubmit, submitting }: Props) {
  const reducedMotion = useReducedMotion();
  const form = useForm<GigInput>({
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);

  const goNext = async () => {
    const fields = FIELDS_PER_STEP[step];
    const valid = fields.length === 0 ? true : await form.trigger(fields);
    if (!valid) return;
    const next = Math.min(step + 1, STEPS.length - 1);
    setStep(next);
    setMaxReached((m) => Math.max(m, next));
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const jump = (idx: number) => {
    if (idx <= maxReached) setStep(idx);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const isLast = step === STEPS.length - 1;
  const slideDirection = reducedMotion ? 0 : 24;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <StepIndicator steps={STEPS} current={step} maxReached={maxReached} onJump={jump} />

      <div className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: slideDirection }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slideDirection }}
            transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
          >
            {step === 0 && <Step1Service form={form} />}
            {step === 1 && <Step2Audience form={form} />}
            {step === 2 && <Step3Delivery form={form} />}
            {step === 3 && <Step4Pricing form={form} />}
            {step === 4 && <Step5Review form={form} onEdit={jump} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={step === 0 || submitting}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>

        {!isLast ? (
          <Button type="button" onClick={() => void goNext()} disabled={submitting}>
            Continue <ArrowRight className="size-4" />
          </Button>
        ) : (
          <div className="flex flex-col items-end">
            <Button type="submit" disabled={submitting} size="lg">
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Queuing…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generate my gig
                </>
              )}
            </Button>
            <p className="mt-1 text-[11px] text-muted-foreground">Uses 1 credit. ~30s.</p>
          </div>
        )}
      </div>
    </form>
  );
}
