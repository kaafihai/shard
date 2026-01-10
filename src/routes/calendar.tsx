import { createFileRoute } from '@tanstack/react-router';
import { Calendar as CalendarIcon } from 'lucide-react';

export const Route = createFileRoute('/calendar')({
  component: CalendarComponent,
});

function CalendarComponent() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <CalendarIcon className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold">Calendar</h2>
      </div>
      <div className="text-center text-muted-foreground py-12">
        <p>Calendar view coming soon...</p>
      </div>
    </div>
  );
}
