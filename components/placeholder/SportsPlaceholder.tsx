"use client";

import { TrophyIcon } from "@phosphor-icons/react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function SportsPlaceholder() {
  return (
    <ComingSoon
      icon={TrophyIcon}
      title="Sports"
      description="Sports highlights and live coverage"
    />
  );
}
