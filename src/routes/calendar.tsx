import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "@phosphor-icons/react/dist/ssr";
import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const navigate = useNavigate();

  const handleDayClick = (date: Date) => {
    const timestamp = date.getTime();
    navigate({ to: "/calendar/$timestamp", params: { timestamp: String(timestamp) } });
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <CalendarIcon className="size-8" />
        <h2 className="text-3xl font-bold">Calendar</h2>
      </div>
      <section className="size-full">
        <Calendar className="w-full" onDayClick={handleDayClick} />
      </section>
      <Outlet />
    </div>
  );
}
