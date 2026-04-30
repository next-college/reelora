import Link from "next/link";
import { UserCircleIcon } from "@phosphor-icons/react/dist/ssr";

export default function SignedOutView() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-text-primary tracking-tight mb-6">
        You
      </h1>

      <div className="flex flex-col items-center text-center p-8 rounded-xl border border-border-default">
        <div className="w-16 h-16 rounded-2xl bg-bg-hover flex items-center justify-center mb-4">
          <UserCircleIcon size={28} className="text-text-muted" />
        </div>
        <h2 className="text-base font-semibold text-text-primary">
          Sign in to Reelora
        </h2>
        <p className="text-sm text-text-muted mt-1.5 max-w-sm">
          Sign in to access your channel, library, subscriptions, and more.
        </p>
        <div className="flex items-center gap-2 mt-5">
          <Link
            href="/signin"
            className="inline-flex items-center px-5 py-2 bg-amber-500 text-text-inverse text-sm font-medium rounded-md hover:bg-amber-300 active:scale-[0.98] transition-base"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center px-5 py-2 border border-border-default text-text-secondary text-sm font-medium rounded-md hover:bg-bg-hover active:scale-[0.98] transition-base"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
