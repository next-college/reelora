import type { Metadata } from "next";
import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import LibraryView from "@/components/library/LibraryView";

export const metadata: Metadata = {
  title: "Library - Reelora",
};

export default function LibraryPage() {
  return (
    <DirectionalTransition>
      <LibraryView />
    </DirectionalTransition>
  );
}
