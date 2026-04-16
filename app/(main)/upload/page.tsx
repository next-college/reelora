import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import UploadView from "@/components/video/UploadView";

export default function UploadPage() {
  return (
    <DirectionalTransition>
      <UploadView />
    </DirectionalTransition>
  );
}
