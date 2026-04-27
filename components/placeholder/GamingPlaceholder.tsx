"use client";

import { GameControllerIcon } from "@phosphor-icons/react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function GamingPlaceholder() {
  return (
    <ComingSoon
      icon={GameControllerIcon}
      title="Gaming"
      description="Gaming videos and recordings"
    />
  );
}
