"use client";

import { signOut } from "next-auth/react";
import { SignOutIcon } from "@phosphor-icons/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="group flex items-center gap-4 p-4 rounded-xl border border-border-default hover:bg-bg-hover transition-base text-left w-full"
    >
      <div className="w-10 h-10 rounded-lg bg-bg-hover group-hover:bg-bg-surface flex items-center justify-center shrink-0 transition-base">
        <SignOutIcon size={18} className="text-text-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">Sign out</p>
        <p className="text-xs text-text-muted mt-0.5">
          Sign out of your Reelora account on this device
        </p>
      </div>
    </button>
  );
}
