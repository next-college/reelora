"use client";

import { ClockIcon } from "@phosphor-icons/react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function HistoryPlaceholder() {
  return (
    <ComingSoon
      icon={ClockIcon}
      title="Watch history"
      description="Videos you've watched will appear here"
    />
  );
}
