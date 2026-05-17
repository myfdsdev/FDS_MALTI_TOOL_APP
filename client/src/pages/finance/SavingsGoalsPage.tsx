import * as React from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SavingsGoalCard } from "@/components/finance/SavingsGoalCard";
import { useCreateSavingsGoal, useListSavingsGoals } from "@/lib/finance.queries";
import { deleteSavingsGoal, updateSavingsGoal } from "@/lib/finance.api";
import { useQueryClient } from "@tanstack/react-query";
import { financeKeys } from "@/lib/finance.queries";
import { useAuthStore } from "@/stores/auth.store";
import { extractErrorMessage } from "@/lib/api";
import type { SavingsGoal, SavingsGoalStatus } from "@/types/finance";

const goalFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  targetAmount: z.coerce.number().positive("Target must be greater than 0"),
  currentAmount: z.coerce.number().min(0),
  targetDate: z.string().optional().default(""),
  status: z.enum(["active", "completed", "archived"]).default("active"),
});
type GoalFormValues = z.infer<typeof goalFormSchema>;

export default function SavingsGoalsPage() {
  const { data: goals = [], isLoading } = useListSavingsGoals();
  const createGoal = useCreateSavingsGoal();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<SavingsGoal | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(goal: SavingsGoal) {
    setEditing(goal);
    setDialogOpen(true);
  }

  async function handleSave(values: GoalFormValues) {
    const payload = {
      name: values.name,
      targetAmount: Number(values.targetAmount),
      currentAmount: Number(values.currentAmount),
      targetDate: values.targetDate ? new Date(values.targetDate).toISOString() : null,
      status: values.status as SavingsGoalStatus,
    };
    try {
      if (editing) {
        await updateSavingsGoal(editing._id, payload);
        toast.success("Goal updated");
      } else {
        await createGoal.mutateAsync(payload);
        toast.success("Goal created");
      }
      queryClient.invalidateQueries({ queryKey: financeKeys.all(userId) });
      setEditing(null);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't save that goal"));
      throw error;
    }
  }

  async function handleDelete(goal: SavingsGoal) {
    if (!window.confirm("Delete this savings goal?")) return;
    try {
      await deleteSavingsGoal(goal._id);
      queryClient.invalidateQueries({ queryKey: financeKeys.all(userId) });
      toast.success("Goal deleted");
    } catch (error) {
      toast.error(extractErrorMessage(error, "Couldn't delete that goal"));
    }
  }

  const active = goals.filter((g) => g.status === "active");
  const completed = goals.filter((g) => g.status === "completed");
  const archived = goals.filter((g) => g.status === "archived");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Target className="size-3.5 text-primary" />
            Savings goals
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Savings goals</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Set a target, track your progress, and stay motivated.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="size-4" />
          New goal
        </Button>
      </header>

      <GoalGroup
        title="Active"
        goals={active}
        emptyMessage={isLoading ? "Loading..." : "No active goals yet."}
        onEdit={openEdit}
        onDelete={(g) => void handleDelete(g)}
      />
      {completed.length > 0 && (
        <GoalGroup
          title="Completed"
          goals={completed}
          onEdit={openEdit}
          onDelete={(g) => void handleDelete(g)}
        />
      )}
      {archived.length > 0 && (
        <GoalGroup
          title="Archived"
          goals={archived}
          onEdit={openEdit}
          onDelete={(g) => void handleDelete(g)}
        />
      )}

      <GoalDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        editing={editing}
        isPending={createGoal.isPending}
        onSubmit={handleSave}
      />
    </div>
  );
}

function GoalGroup({
  title,
  goals,
  emptyMessage,
  onEdit,
  onDelete,
}: {
  title: string;
  goals: SavingsGoal[];
  emptyMessage?: string;
  onEdit: (g: SavingsGoal) => void;
  onDelete: (g: SavingsGoal) => void;
}) {
  return (
    <section className="mt-8 space-y-3">
      <h2 className="text-sm font-bold tracking-tight">{title}</h2>
      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            {emptyMessage ?? "Nothing here yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {goals.map((g) => (
            <SavingsGoalCard
              key={g._id}
              goal={g}
              onEdit={() => onEdit(g)}
              onDelete={() => onDelete(g)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function GoalDialog({
  open,
  onOpenChange,
  editing,
  isPending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: SavingsGoal | null;
  isPending: boolean;
  onSubmit: (values: GoalFormValues) => Promise<void>;
}) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: "",
      targetAmount: "" as unknown as number,
      currentAmount: 0,
      targetDate: "",
      status: "active",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      name: editing?.name ?? "",
      targetAmount: editing?.targetAmount ?? ("" as unknown as number),
      currentAmount: editing?.currentAmount ?? 0,
      targetDate: editing?.targetDate ? editing.targetDate.slice(0, 10) : "",
      status: editing?.status ?? "active",
    });
  }, [editing, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit goal" : "New savings goal"}</DialogTitle>
          <DialogDescription>
            Give it a name, a target amount, and an optional target date.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmit(values);
            onOpenChange(false);
          })}
          className="space-y-4 px-6 pb-6"
        >
          <div className="space-y-2">
            <Label htmlFor="goal-name">Name</Label>
            <Input id="goal-name" placeholder="e.g. Emergency fund" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="goal-target">Target amount</Label>
              <Input
                id="goal-target"
                type="number"
                step="0.01"
                min="0"
                {...form.register("targetAmount", { valueAsNumber: true })}
              />
              {form.formState.errors.targetAmount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.targetAmount.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-current">Already saved</Label>
              <Input
                id="goal-current"
                type="number"
                step="0.01"
                min="0"
                {...form.register("currentAmount", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="goal-date">Target date (optional)</Label>
              <Input id="goal-date" type="date" {...form.register("targetDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-status">Status</Label>
              <Select id="goal-status" {...form.register("status")}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
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
