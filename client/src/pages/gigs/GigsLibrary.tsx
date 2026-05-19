import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Briefcase, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useGigs } from "@/lib/gigs.queries";
import { GigCard } from "@/components/gigs/GigCard";
import { PLATFORM_OPTIONS } from "@/components/gigs/form/platformOptions";
import type { GigPlatform, GigStatus } from "@/types/gigs";

export default function GigsLibrary() {
  const reducedMotion = useReducedMotion();
  const [platform, setPlatform] = useState<GigPlatform | "">("");
  const [status, setStatus] = useState<GigStatus | "">("");
  const [search, setSearch] = useState("");

  const { data: gigs = [], isLoading } = useGigs({
    platform: platform || undefined,
    status: status || undefined,
    archived: false,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return gigs;
    return gigs.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.input.serviceName?.toLowerCase().includes(q) ||
        g.input.niche?.toLowerCase().includes(q),
    );
  }, [gigs, search]);

  const completed = gigs.filter((g) => g.status === "completed" || g.status === "partial");
  const avgScore =
    completed.length > 0
      ? Math.round(
          completed.reduce((sum, g) => sum + (g.score?.overall ?? 0), 0) / completed.length,
        )
      : 0;

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Briefcase className="size-3.5 text-primary" />
              Gigs
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Gigs</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              AI-generated gig copy, lead strategy, and outreach messages for Fiverr, Upwork,
              LinkedIn, Instagram and Freelancer.
            </p>
          </div>

          <Link
            to="/gigs/new"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
          >
            <Plus className="size-4" /> New gig
          </Link>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Total gigs" value={String(gigs.length)} />
          <Stat label="Completed" value={String(completed.length)} />
          <Stat label="Avg overall score" value={completed.length ? String(avgScore) : "—"} />
        </section>

        <section className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or niche"
              className="pl-8"
            />
          </div>
          <Select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as GigPlatform | "")}
            className="md:max-w-[180px]"
            aria-label="Filter by platform"
          >
            <option value="">All platforms</option>
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as GigStatus | "")}
            className="md:max-w-[180px]"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="queued">Queued</option>
            <option value="processing">Generating</option>
            <option value="partial">Partial</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </Select>
        </section>

        <section className="mt-8">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted/50" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 px-6 py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Briefcase className="size-8" />
                </div>
                <div>
                  <p className="text-xl font-semibold">
                    {gigs.length === 0 ? "Generate your first gig" : "No matches"}
                  </p>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    {gigs.length === 0
                      ? "Tell us about your service and we'll generate tier packages, SEO tags, outreach copy, and a lead strategy in one shot."
                      : "Try clearing filters or your search query."}
                  </p>
                </div>
                {gigs.length === 0 && (
                  <Link
                    to="/gigs/new"
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
                  >
                    <Plus className="size-4" /> New gig
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: reducedMotion ? 0 : 0.04 } } }}
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {filtered.map((gig) => (
                <GigCard key={gig._id} gig={gig} reducedMotion={Boolean(reducedMotion)} />
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="px-4 py-3">
        <p className="text-[11px] font-medium uppercase text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
