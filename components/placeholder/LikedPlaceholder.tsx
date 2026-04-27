"use client";

import { ThumbsUpIcon } from "@phosphor-icons/react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function LikedPlaceholder() {
  return (
    <ComingSoon
      icon={ThumbsUpIcon}
      title="Liked videos"
      description="Videos you've liked will appear here"
    />
  );
}
