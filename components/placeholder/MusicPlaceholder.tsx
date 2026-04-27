"use client";

import { MusicNoteIcon } from "@phosphor-icons/react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function MusicPlaceholder() {
  return (
    <ComingSoon
      icon={MusicNoteIcon}
      title="Music"
      description="Music videos"
    />
  );
}
