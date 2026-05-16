import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { FloatingIcons } from "@/components/landing/FloatingIcons";

export function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[78vh] max-w-6xl items-center justify-center px-6">
      <FloatingIcons />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-2xl text-center"
      >
        <span className="inline-flex items-center rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          AI and business tools - One workspace
        </span>
        <h1 className="mt-5 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Every AI tool your business needs, in one place.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          Hooks, captions, emails, brand kits, video scripts, local ads - generate
          them all from a single, fast workspace.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
          >
            Start free
          </Link>
          <Link
            to="/login"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-medium hover:bg-accent"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
