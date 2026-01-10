import { GearSixIcon } from "@phosphor-icons/react/dist/ssr";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: SettingsComponent,
});

function SettingsComponent() {
  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <GearSixIcon className="size-8" />
        <h2 className="text-3xl font-bold">Settings</h2>
      </div>
      <div className="text-center text-muted-foreground py-12">
        <p>Settings coming soon</p>
      </div>
    </div>
  );
}
