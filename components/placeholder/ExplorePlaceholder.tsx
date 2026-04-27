"use client";

import { CompassIcon } from "@phosphor-icons/react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function ExplorePlaceholder() {
  return (
    <ComingSoon
      icon={CompassIcon}
      title="Explore"
      description="Discover new content and creators"
    />
  );
}
