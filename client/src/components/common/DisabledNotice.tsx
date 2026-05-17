import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

interface Props {
  title?: string;
  message?: string;
}

/**
 * Shown when the user lands on a page whose tool/workspace has been globally
 * disabled by the admin.
 */
export function DisabledNotice({
  title = "This feature is currently disabled",
  message = "The site administrator has temporarily turned this off for everyone. Check back later.",
}: Props) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Lock className="size-7" />
      </div>
      <div>
        <p className="text-lg font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
