import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@phosphor-icons/react/dist/ssr";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <CalendarIcon className="size-8" />
        <h2 className="text-3xl font-bold">Calendar</h2>
      </div>
      <section className="size-full">
        <Calendar className="w-full" />
      </section>
    </div>
  );
}
