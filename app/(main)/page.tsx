import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import HomeFeed from "@/components/video/HomeFeed";

export default function HomePage() {
  return (
    <DirectionalTransition>
      <HomeFeed />
    </DirectionalTransition>
  );
}
