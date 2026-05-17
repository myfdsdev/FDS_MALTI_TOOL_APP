import { ArrowDownCircle, ArrowUpCircle, Wallet, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/types/finance";
import { cn } from "@/lib/utils";

interface Props {
  income: number;
  expenses: number;
  net: number;
  transactionCount: number;
  currency?: string;
}

export function FinanceSummaryCards({
  income,
  expenses,
  net,
  transactionCount,
  currency = "INR",
}: Props) {
  const cards = [
    {
      label: "Income this month",
      value: formatCurrency(income, currency),
      icon: ArrowUpCircle,
      tone: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Spent this month",
      value: formatCurrency(expenses, currency),
      icon: ArrowDownCircle,
      tone: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Net (income - spent)",
      value: formatCurrency(net, currency),
      icon: Wallet,
      tone: net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Transactions",
      value: String(transactionCount),
      icon: Receipt,
      tone: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label}>
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className={cn("size-4", c.tone)} />
                <span className="truncate">{c.label}</span>
              </div>
              <div className={cn("text-xl font-semibold tabular-nums", c.tone)}>{c.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
