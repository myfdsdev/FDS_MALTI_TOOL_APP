import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpDown } from "lucide-react";
import type { MonetizationStream, SetupEffort } from "@/types/reports";
import { cn } from "@/lib/utils";

interface Props {
  streams: MonetizationStream[];
}

type SortKey = "name" | "setupEffort" | "fitScore";

const EFFORT_TONE: Record<SetupEffort, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

export function StreamsTable({ streams }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("fitScore");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const copy = [...streams];
    copy.sort((a, b) => {
      const dir = direction === "asc" ? 1 : -1;
      if (sortKey === "fitScore") return (a.fitScore - b.fitScore) * dir;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      const order: SetupEffort[] = ["low", "medium", "high"];
      return (order.indexOf(a.setupEffort) - order.indexOf(b.setupEffort)) * dir;
    });
    return copy;
  }, [streams, sortKey, direction]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection(key === "name" ? "asc" : "desc");
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <header className="border-b border-border p-5">
        <h2 className="text-lg font-semibold tracking-tight">Revenue streams</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Sorted by fit score for this site. Click any column header to sort.
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <Th onClick={() => toggleSort("name")} active={sortKey === "name"} direction={direction}>
                Stream
              </Th>
              <Th onClick={() => toggleSort("setupEffort")} active={sortKey === "setupEffort"} direction={direction}>
                Effort
              </Th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Monthly potential</th>
              <Th onClick={() => toggleSort("fitScore")} active={sortKey === "fitScore"} direction={direction}>
                Fit
              </Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <motion.tr
                key={s.name}
                layout
                className="border-t border-border align-top transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-3">
                  <p className="font-medium">{s.name}</p>
                  <p className="mt-0.5 max-w-md text-xs text-muted-foreground">{s.description}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-medium", EFFORT_TONE[s.setupEffort])}>
                    {s.setupEffort}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{s.timeToFirstRevenue}</td>
                <td className="px-4 py-3 text-xs">{s.monthlyRevenuePotential}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${s.fitScore}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-xs">{s.fitScore}</span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({
  onClick,
  active,
  direction,
  children,
}: {
  onClick: () => void;
  active: boolean;
  direction: "asc" | "desc";
  children: React.ReactNode;
}) {
  return (
    <th className="px-4 py-3">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 transition-colors",
          active ? "text-foreground" : "hover:text-foreground"
        )}
      >
        {children}
        <ArrowUpDown className={cn("size-3", active && (direction === "asc" ? "" : "rotate-180"))} />
      </button>
    </th>
  );
}
