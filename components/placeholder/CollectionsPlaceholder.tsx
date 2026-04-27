"use client";

import { FolderIcon } from "@phosphor-icons/react";
import ComingSoon from "@/components/layout/ComingSoon";

export default function CollectionsPlaceholder() {
  return (
    <ComingSoon
      icon={FolderIcon}
      title="Collections"
      description="Save and organize videos into collections"
    />
  );
}
