import DirectionalTransition from "@/components/transitions/DirectionalTransition";
import SettingsView from "@/components/settings/SettingsView";

export default function SettingsPage() {
  return (
    <DirectionalTransition>
      <SettingsView />
    </DirectionalTransition>
  );
}
