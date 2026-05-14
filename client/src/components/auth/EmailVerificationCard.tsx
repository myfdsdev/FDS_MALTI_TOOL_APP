import { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Loader2, Mail, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/auth.store";
import { useSendVerification } from "@/lib/queries";
import { extractErrorMessage } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Profile card for the email-verification flow. Matches the Profile page's
 * card / icon-tile / tone system.
 */
export function EmailVerificationCard() {
  const user = useAuthStore((s) => s.user);
  const send = useSendVerification();
  const [devUrl, setDevUrl] = useState<string | null>(null);

  if (!user) return null;

  const verified = !!user.emailVerified;

  const onSend = async () => {
    setDevUrl(null);
    try {
      const res = await send.mutateAsync();
      toast.success("Verification email sent");
      if (res.verificationUrl) {
        // Keep only the path + query so it routes within the SPA.
        try {
          const u = new URL(res.verificationUrl);
          setDevUrl(u.pathname + u.search);
        } catch {
          setDevUrl(res.verificationUrl);
        }
      }
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't send verification email"));
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3 space-y-0">
        <div
          className={
            verified
              ? "flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
              : "flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }
        >
          {verified ? <BadgeCheck className="size-4" /> : <ShieldAlert className="size-4" />}
        </div>
        <div className="space-y-1.5">
          <CardTitle>Email verification</CardTitle>
          <CardDescription>
            {verified
              ? "Your email address is verified."
              : "Confirm your email address to secure your account."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background/70 p-3">
          <Mail className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-sm">{user.email}</span>
          <span
            className={
              verified
                ? "inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                : "inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400"
            }
          >
            {verified ? "Verified" : "Unverified"}
          </span>
        </div>

        {!verified && (
          <>
            <p className="text-sm text-muted-foreground">
              We&rsquo;ll send a verification link to your inbox. The link is valid
              for 24 hours.
            </p>
            <Button onClick={onSend} disabled={send.isPending} className="w-full sm:w-auto">
              {send.isPending && <Loader2 className="size-4 animate-spin" />}
              {send.isPending ? "Sending…" : "Send verification email"}
            </Button>

            {devUrl && (
              <div className="rounded-xl border border-dashed border-border bg-muted/40 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Dev mode — no mailer configured. Use this link to verify:
                </p>
                <Link
                  to={devUrl}
                  className="mt-1.5 block break-all text-xs font-medium text-primary hover:underline"
                >
                  {devUrl}
                </Link>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
