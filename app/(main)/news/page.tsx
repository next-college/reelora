import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import NewsPlaceholder from "@/components/placeholder/NewsPlaceholder";

export default function NewsPage() {
  return (
    <DirectionalTransition>
      <NewsPlaceholder />
    </DirectionalTransition>
  );
}
