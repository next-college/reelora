import Link from "next/link";
import {
  ClockIcon,
  ThumbsUpIcon,
  FolderIcon,
  CaretRightIcon,
} from "@phosphor-icons/react/dist/ssr";

const sections = [
  {
    href: "/history",
    label: "History",
    description: "Videos you've watched",
    icon: ClockIcon,
  },
  {
    href: "/liked",
    label: "Liked videos",
    description: "Videos you've liked",
    icon: ThumbsUpIcon,
  },
  {
    href: "/collections",
    label: "Collections",
    description: "Save and organize videos into collections",
    icon: FolderIcon,
  },
];

export default function LibraryView() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-text-primary tracking-tight mb-6">
        Library
      </h1>

      <div className="flex flex-col gap-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group flex items-center gap-4 p-4 rounded-xl border border-border-default hover:bg-bg-hover transition-base"
            >
              <div className="w-12 h-12 rounded-xl bg-bg-hover group-hover:bg-bg-surface flex items-center justify-center shrink-0 transition-base">
                <Icon size={22} className="text-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  {section.label}
                </p>
                <p className="text-xs text-text-muted mt-0.5 truncate">
                  {section.description}
                </p>
              </div>
              <CaretRightIcon
                size={16}
                className="text-text-muted group-hover:text-text-secondary transition-base shrink-0"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
