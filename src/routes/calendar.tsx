import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { CalendarIcon } from "@phosphor-icons/react/dist/ssr";
import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router";
import { useTasks } from "@/hooks/use-tasks";
import { useMoods } from "@/hooks/use-moods";
import type { MoodLevel } from "@/lib/types";
import type { DayButton } from "react-day-picker";
import { MOOD_OPTIONS } from "@/components/mood-tracker-form";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});


function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function CalendarPage() {
  const navigate = useNavigate();
  const { data: tasks } = useTasks();
  const { data: moods } = useMoods();

  // Build lookup maps for completed tasks and moods by date
  const completedTaskDates = new Set<string>();
  const moodByDate = new Map<string, MoodLevel>();

  tasks?.forEach((task) => {
    if (task.completedAt) {
      const date = new Date(task.completedAt);
      completedTaskDates.add(formatDateKey(date));
    }
  });

  moods?.forEach((mood) => {
    const date = new Date(mood.createdAt);
    moodByDate.set(formatDateKey(date), mood.mood);
  });

  const handleDayClick = (date: Date) => {
    const timestamp = date.getTime();
    navigate({ to: "/calendar/$timestamp", params: { timestamp: String(timestamp) } });
  };

  function CustomDayButton(props: React.ComponentProps<typeof DayButton>) {
    const dateKey = formatDateKey(props.day.date);
    const hasCompletedTask = completedTaskDates.has(dateKey);
    const mood = moodByDate.get(dateKey);

    const MoodIcon =  MOOD_OPTIONS.find(m => m.value === mood)?.icon;

    return (
      <div className="relative w-full">
        <CalendarDayButton {...props} />
        {MoodIcon && (<MoodIcon className="absolute -top-1 -left-1 bg-background rounded-full size-6 text-primary z-10" />)}
        {hasCompletedTask && (
            <div className="absolute bottom-2 right-1/2 left-1/2 size-2 rounded-full bg-destructive/20 z-50" />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <CalendarIcon className="size-8" />
        <h2 className="text-3xl font-bold">Calendar</h2>
      </div>
      <section className="size-full">
        <Calendar
          className="w-full"
          onDayClick={handleDayClick}
          components={{ DayButton: CustomDayButton }}
        />
      </section>
      <Outlet />
    </div>
  );
}
