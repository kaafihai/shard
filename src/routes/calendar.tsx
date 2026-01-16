import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { CalendarIcon } from "@phosphor-icons/react/dist/ssr";
import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router";
import { useTasks } from "@/hooks/use-tasks";
import { useMoods } from "@/hooks/use-moods";
import type { MoodLevel } from "@/lib/types";
import type { DayButton } from "react-day-picker";
import { MOOD_OPTIONS } from "@/components/mood-tracker-form";
import { CheckCircleIcon } from "@phosphor-icons/react";

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
        <span className="pointer-events-none flex gap-1 w-full justify-center absolute -top-2 z-10">
          {MoodIcon &&<MoodIcon className="size-6 rounded-full p-1 bg-background border border-primary text-primary" />}
          {hasCompletedTask && (<CheckCircleIcon className="size-6 text-primary bg-background border border-primary rounded-full p-1" />)}  
        </span>
        
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
