"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HouseIcon,
  CompassIcon,
  PlusCircleIcon,
  FolderIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof HouseIcon;
  match: "exact" | string[];
};

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: HouseIcon, match: "exact" },
  {
    href: "/explore",
    label: "Explore",
    icon: CompassIcon,
    match: ["/explore"],
  },
  {
    href: "/upload",
    label: "Create",
    icon: PlusCircleIcon,
    match: ["/upload"],
  },
  {
    href: "/library",
    label: "Library",
    icon: FolderIcon,
    match: ["/library", "/history", "/liked", "/collections"],
  },
  {
    href: "/you",
    label: "You",
    icon: UserCircleIcon,
    match: ["/you", "/settings"],
  },
];

function isActive(item: NavItem, pathname: string): boolean {
  if (item.match === "exact") return pathname === item.href;
  return item.match.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav style={{ viewTransitionName: "persistent-mobile-nav" }} className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-border-default md:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const active = isActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-base ${
                active
                  ? "text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon size={20} weight={active ? "fill" : "regular"} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
