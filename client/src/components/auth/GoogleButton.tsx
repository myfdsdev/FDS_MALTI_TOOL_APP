import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useGoogleLogin } from "@/lib/queries";
import { extractErrorMessage } from "@/lib/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            ux_mode?: "popup" | "redirect";
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number;
            },
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

// Module-level state — GSI is a singleton on `window.google` and only needs to be
// initialized once per page, regardless of how many GoogleButton instances mount.
let gsiInitialized = false;
let latestCallback: ((credential: string) => void) | null = null;

function ensureInitialized(clientId: string) {
  if (gsiInitialized || !window.google) return false;
  window.google.accounts.id.initialize({
    client_id: clientId,
    ux_mode: "popup",
    callback: (response) => {
      latestCallback?.(response.credential);
    },
  });
  gsiInitialized = true;
  return true;
}

export function GoogleButton({ onSuccess }: { onSuccess?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const googleLogin = useGoogleLogin();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  // Keep the latest callback in a ref so we never need to re-init GSI
  // when the parent re-renders.
  const onSuccessRef = useRef(onSuccess);
  const mutateRef = useRef(googleLogin.mutateAsync);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    mutateRef.current = googleLogin.mutateAsync;
  });

  useEffect(() => {
    latestCallback = async (credential: string) => {
      try {
        await mutateRef.current(credential);
        toast.success("Signed in with Google");
        onSuccessRef.current?.();
      } catch (err) {
        toast.error(extractErrorMessage(err, "Google sign-in failed"));
      }
    };
    return () => {
      latestCallback = null;
    };
  }, []);

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tryRender = () => {
      if (cancelled || !window.google || !ref.current) return false;
      if (!ensureInitialized(clientId)) {
        // initialize requires window.google to be present; we already checked.
      }
      // Avoid rendering the button into a node that already has one.
      if (ref.current.childElementCount > 0) {
        setReady(true);
        return true;
      }
      window.google.accounts.id.renderButton(ref.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 320,
      });
      setReady(true);
      return true;
    };

    if (!tryRender()) {
      intervalId = setInterval(() => {
        if (tryRender() && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [clientId]);

  if (!clientId) {
    return (
      <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
        Set <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> to enable Google sign-in.
      </div>
    );
  }

  return (
    <div className="flex min-h-10 justify-center">
      <div ref={ref} aria-label="Continue with Google" />
      {!ready && (
        <div className="h-10 w-[320px] animate-pulse rounded-md bg-muted" aria-hidden />
      )}
    </div>
  );
}
