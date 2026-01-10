import { createFileRoute } from '@tanstack/react-router';
import { Settings as SettingsIcon } from 'lucide-react';

export const Route = createFileRoute('/settings')({
  component: SettingsComponent,
});

function SettingsComponent() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold">Settings</h2>
      </div>
      <div className="text-center text-muted-foreground py-12">
        <p>Settings coming soon...</p>
      </div>
    </div>
  );
}
