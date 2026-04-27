"use client";

import { FireIcon } from "@phosphor-icons/react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function TrendingPlaceholder() {
  return (
    <ComingSoon
      icon={FireIcon}
      title="Trending"
      description="See what's popular on Reelora right now"
    />
  );
}
