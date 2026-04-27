import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import MusicPlaceholder from "@/components/placeholder/MusicPlaceholder";

export default function MusicPage() {
  return (
    <DirectionalTransition>
      <MusicPlaceholder />
    </DirectionalTransition>
  );
}
