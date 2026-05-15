import { Link } from "react-router-dom";

import { NotFoundTrain } from "@/components/common/NotFoundTrain";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full max-w-6xl rounded-[2rem] border border-border/60 bg-card/80 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur sm:p-6 lg:p-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <div className="w-full">
            <NotFoundTrain />
          </div>
          <div className="max-w-xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">404</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Page not found</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              The page you were looking for doesn&apos;t exist, moved, or left on the last train out.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
