"use client";

import { NewspaperIcon } from "@phosphor-icons/react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function NewsPlaceholder() {
  return (
    <ComingSoon
      icon={NewspaperIcon}
      title="News"
      description="Stay up to date with the latest news"
    />
  );
}
