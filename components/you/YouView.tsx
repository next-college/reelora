import { Suspense } from "react";
import Link from "next/link";
import {
  GearSixIcon,
  UsersThreeIcon,
  CaretRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import ChannelPreview from "./ChannelPreview";
import ChannelPreviewSkeleton from "./ChannelPreviewSkeleton";
import SignOutButton from "./SignOutButton";

const accountLinks = [
  {
    href: "/signin",
    label: "Switch account",
    description: "Sign in with a different account",
    icon: UsersThreeIcon,
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Manage your profile and account",
    icon: GearSixIcon,
  },
];

interface YouViewProps {
  userId: string;
}

export default function YouView({ userId }: YouViewProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-text-primary tracking-tight mb-6">
        You
      </h1>

      <Suspense fallback={<ChannelPreviewSkeleton />}>
        <ChannelPreview userId={userId} />
      </Suspense>

      <div className="flex flex-col gap-2 mt-3">
        {accountLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-4 p-4 rounded-xl border border-border-default hover:bg-bg-hover transition-base"
            >
              <div className="w-10 h-10 rounded-lg bg-bg-hover group-hover:bg-bg-surface flex items-center justify-center shrink-0 transition-base">
                <Icon size={18} className="text-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  {link.label}
                </p>
                <p className="text-xs text-text-muted mt-0.5 truncate">
                  {link.description}
                </p>
              </div>
              <CaretRightIcon
                size={16}
                className="text-text-muted group-hover:text-text-secondary transition-base shrink-0"
              />
            </Link>
          );
        })}

        <SignOutButton />
      </div>
    </div>
  );
}
