import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import LikedPlaceholder from "@/components/placeholder/LikedPlaceholder";

export default function LikedPage() {
  return (
    <DirectionalTransition>
      <LikedPlaceholder />
    </DirectionalTransition>
  );
}
