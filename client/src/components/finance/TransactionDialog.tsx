import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EXPENSE_CATEGORY_SUGGESTIONS,
  INCOME_CATEGORY_SUGGESTIONS,
  TRANSACTION_SOURCES,
} from "@/types/finance";

const transactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.string().trim().min(1, "Category is required").max(60),
  date: z.string().min(1, "Date is required"),
  note: z.string().trim().max(500).optional().default(""),
  source: z
    .union([z.enum(["salary", "freelance", "cash", "card", "upi", "bank", "other"]), z.literal("")])
    .optional()
    .default(""),
});

export type TransactionDialogValues = z.infer<typeof transactionSchema>;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionDialog({
  open,
  onOpenChange,
  title = "New transaction",
  description = "Add a new income or expense entry.",
  defaultValues,
  isPending = false,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  defaultValues?: Partial<TransactionDialogValues>;
  isPending?: boolean;
  onSubmit: (values: TransactionDialogValues) => Promise<void> | void;
}) {
  const form = useForm<TransactionDialogValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: defaultValues?.type ?? "expense",
      amount: defaultValues?.amount ?? ("" as unknown as number),
      category: defaultValues?.category ?? "",
      date: defaultValues?.date ?? todayIso(),
      note: defaultValues?.note ?? "",
      source: defaultValues?.source ?? "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      type: defaultValues?.type ?? "expense",
      amount: defaultValues?.amount ?? ("" as unknown as number),
      category: defaultValues?.category ?? "",
      date: defaultValues?.date ?? todayIso(),
      note: defaultValues?.note ?? "",
      source: defaultValues?.source ?? "",
    });
  }, [defaultValues, form, open]);

  const type = form.watch("type");
  const suggestions = type === "income" ? INCOME_CATEGORY_SUGGESTIONS : EXPENSE_CATEGORY_SUGGESTIONS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
            onOpenChange(false);
          })}
          className="space-y-4 px-6 pb-6"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tx-type">Type</Label>
              <Select id="tx-type" {...form.register("type")}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-amount">Amount</Label>
              <Input
                id="tx-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tx-category">Category</Label>
              <Input
                id="tx-category"
                list="finance-category-suggestions"
                placeholder="e.g. food, salary"
                {...form.register("category")}
              />
              <datalist id="finance-category-suggestions">
                {suggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              {form.formState.errors.category && (
                <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tx-date">Date</Label>
              <Input id="tx-date" type="date" {...form.register("date")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-source">Source (optional)</Label>
            <Select id="tx-source" {...form.register("source")}>
              <option value="">—</option>
              {TRANSACTION_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tx-note">Note (optional)</Label>
            <Textarea
              id="tx-note"
              placeholder="What was this for?"
              className="min-h-20"
              {...form.register("note")}
            />
          </div>

          <DialogFooter className="px-0 pb-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
