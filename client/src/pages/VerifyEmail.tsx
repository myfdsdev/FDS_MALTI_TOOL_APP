import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { BadgeCheck, Loader2, TriangleAlert } from "lucide-react";

import { AuthLayout } from "@/pages/Login";
import { Card, CardContent } from "@/components/ui/card";
import { useVerifyEmail } from "@/lib/queries";
import { useAuthStore } from "@/stores/auth.store";
import { extractErrorMessage } from "@/lib/api";

type Status = "verifying" | "success" | "error";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const verify = useVerifyEmail();
  const isAuthed = useAuthStore((s) => s.status === "authenticated");

  const [status, setStatus] = useState<Status>(token ? "verifying" : "error");
  const [message, setMessage] = useState(
    token ? "" : "This verification link is missing its token.",
  );

  // Guard against double-run in React StrictMode.
  const ran = useRef(false);
  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true;
    verify
      .mutateAsync(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email address has been verified.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(extractErrorMessage(err, "We couldn't verify this link."));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            {status === "verifying" && (
              <>
                <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Loader2 className="size-6 animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-medium">Verifying your email…</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This only takes a moment.
                  </p>
                </div>
              </>
            )}

            {status === "success" && (
              <>
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BadgeCheck className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email verified</p>
                  <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                </div>
                <Link
                  to={isAuthed ? "/profile" : "/login"}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  {isAuthed ? "Back to profile" : "Sign in"}
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <TriangleAlert className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-medium">Verification failed</p>
                  <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                </div>
                <Link
                  to={isAuthed ? "/profile" : "/login"}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-accent"
                >
                  {isAuthed ? "Back to profile" : "Sign in"}
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}
