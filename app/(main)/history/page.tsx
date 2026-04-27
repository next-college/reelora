import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import HistoryPlaceholder from "@/components/placeholder/HistoryPlaceholder";

export default function HistoryPage() {
  return (
    <DirectionalTransition>
      <HistoryPlaceholder />
    </DirectionalTransition>
  );
}
