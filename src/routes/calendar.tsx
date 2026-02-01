import {
  CalendarIcon,
  CheckCircleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CalendarBlankIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router";
import { useTasks } from "@/hooks/use-tasks";
import { useMoods } from "@/hooks/use-moods";
import type { Task, Mood } from "@/lib/types";
import { MOOD_OPTIONS } from "@/components/mood-tracker-form";
import {
  format,
  subDays,
  addDays,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});

function formatDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function CalendarPage() {
  const navigate = useNavigate();
  const { data: tasks } = useTasks();
  const { data: moods } = useMoods();
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();

  const { currentWeek, nextWeek, weekLabel, stats } = useMemo(() => {
    const baseDate = subDays(today, weekOffset * 7);
    const weekStart = startOfWeek(baseDate);
    const weekEnd = endOfWeek(baseDate);

    const nextWeekStart = addDays(weekEnd, 1);
    const nextWeekEnd = addDays(weekEnd, 7);

    const buildWeekData = (start: Date, end: Date) => {
      const days: Array<{
        date: Date;
        dateKey: string;
        completedTasks: Task[];
        dueTasks: Task[];
        overdueTasks: Task[];
        mood: Mood | null;
      }> = [];

      let current = start;
      while (!isAfter(current, end)) {
        const dateKey = formatDateKey(current);
        const completedTasks =
          tasks?.filter((task) => {
            if (!task.completedAt) return false;
            return isSameDay(new Date(task.completedAt), current);
          }) ?? [];
        const allDueTasks =
          tasks?.filter((task) => {
            if (!task.dueDate) return false;
            return isSameDay(new Date(task.dueDate), current);
          }) ?? [];

        const isPastDate = isBefore(startOfDay(current), startOfDay(today));
        const dueTasks = allDueTasks.filter(
          (task) => !task.completedAt && !isPastDate,
        );
        const overdueTasks = allDueTasks.filter(
          (task) => !task.completedAt && isPastDate,
        );

        const mood =
          moods?.find((m) => isSameDay(new Date(m.createdAt), current)) ?? null;

        days.push({
          date: new Date(current),
          dateKey,
          completedTasks,
          dueTasks,
          overdueTasks,
          mood,
        });
        current = addDays(current, 1);
      }
      return days;
    };

    const currentWeekData = buildWeekData(weekStart, weekEnd);
    const nextWeekData = buildWeekData(nextWeekStart, nextWeekEnd);

    // Calculate stats for both weeks
    const allDays = [...currentWeekData, ...nextWeekData];
    const totalDueTasks = allDays.reduce(
      (sum, day) => sum + day.dueTasks.length,
      0,
    );
    const totalOverdueTasks = allDays.reduce(
      (sum, day) => sum + day.overdueTasks.length,
      0,
    );
    const totalCompletedTasks = allDays.reduce(
      (sum, day) => sum + day.completedTasks.length,
      0,
    );

    // Calculate mood trend
    const moodsInPeriod = allDays.map((d) => d.mood).filter(Boolean) as Mood[];
    const moodValues: Record<string, number> = {
      terrible: 1,
      bad: 2,
      okay: 3,
      good: 4,
      great: 5,
    };
    const avgMood =
      moodsInPeriod.length > 0
        ? moodsInPeriod.reduce((sum, m) => sum + (moodValues[m.mood] || 3), 0) /
          moodsInPeriod.length
        : null;

    return {
      currentWeek: currentWeekData,
      nextWeek: nextWeekData,
      weekLabel: `${format(weekStart, "MMM d")} - ${format(nextWeekEnd, "MMM d, yyyy")}`,
      stats: {
        dueTasks: totalDueTasks,
        overdueTasks: totalOverdueTasks,
        completedTasks: totalCompletedTasks,
        avgMood,
        moodCount: moodsInPeriod.length,
      },
    };
  }, [tasks, moods, weekOffset, today]);

  const handleDayClick = (date: Date) => {
    const timestamp = date.getTime();
    navigate({
      to: "/calendar/$timestamp",
      params: { timestamp: String(timestamp) },
    });
  };

  const goToPreviousWeeks = () => setWeekOffset((prev) => prev + 2);
  const goToNextWeeks = () => setWeekOffset((prev) => Math.max(0, prev - 2));
  const goToCurrentWeek = () => setWeekOffset(0);

  const canGoNext = weekOffset > 0;

  const getMoodTrend = () => {
    if (!stats.avgMood) return null;
    if (stats.avgMood >= 4) return { label: "Great", color: "text-green-600" };
    if (stats.avgMood >= 3) return { label: "Good", color: "text-blue-600" };
    if (stats.avgMood >= 2) return { label: "Mixed", color: "text-amber-600" };
    return { label: "Challenging", color: "text-orange-600" };
  };

  const moodTrend = getMoodTrend();

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="size-8" />
          <h2 className="text-3xl font-bold">Calendar</h2>
        </div>
        {weekOffset > 0 && (
          <Button variant="ghost" onClick={goToCurrentWeek}>
            Today
          </Button>
        )}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-primary/10 rounded-3xl space-y-1">
          <div className="flex items-center gap-2">
            <CalendarBlankIcon className="size-5 text-amber-600" />
            <span className="text-sm font-medium">Upcoming</span>
          </div>
          <p className="text-2xl font-bold">{stats.dueTasks}</p>
          <p className="text-xs">tasks due</p>
        </div>

        {stats.overdueTasks > 0 && (
          <div className="p-4 bg-destructive/10 rounded-3xl space-y-1">
            <div className="flex items-center gap-2">
              <CalendarBlankIcon className="size-5 text-destructive" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
            <p className="text-2xl font-bold text-destructive">
              {stats.overdueTasks}
            </p>
            <p className="text-xs">need attention</p>
          </div>
        )}

        <div className="p-4 bg-success/10 rounded-3xl space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="size-5 text-success" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <p className="text-2xl font-bold">{stats.completedTasks}</p>
          <p className="text-xs">tasks done</p>
        </div>

        {moodTrend && (
          <div className="p-4 bg-primary/10 rounded-3xl space-y-1">
            <div className="flex items-center gap-2">
              <TrendUpIcon className="size-5 text-primary" />
              <span className="text-sm font-medium">Mood Trend</span>
            </div>
            <p className={cn("text-2xl font-bold", moodTrend.color)}>
              {moodTrend.label}
            </p>
            <p className="text-xs">{stats.moodCount} entries</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={goToPreviousWeeks}>
          <CaretLeftIcon className="size-4" />
        </Button>
        <span className="text-sm font-medium">{weekLabel}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextWeeks}
          disabled={!canGoNext}
        >
          <CaretRightIcon className="size-4" />
        </Button>
      </div>

      <div className="space-y-6">
        <WeekSection
          title="This Week"
          days={currentWeek}
          onDayClick={handleDayClick}
        />
        <WeekSection
          title="Next Week"
          days={nextWeek}
          onDayClick={handleDayClick}
        />
      </div>

      <Outlet />
    </div>
  );
}

function WeekSection({
  title,
  days,
  onDayClick,
}: {
  title: string;
  days: Array<{
    date: Date;
    dateKey: string;
    completedTasks: Task[];
    dueTasks: Task[];
    overdueTasks: Task[];
    mood: Mood | null;
  }>;
  onDayClick: (date: Date) => void;
}) {
  const getMoodBgClass = (mood: Mood | null) => {
    if (!mood) return "bg-primary/5";
    const moodValue = mood.mood;
    if (moodValue === "great") return "bg-green-500/10";
    if (moodValue === "good") return "bg-blue-500/10";
    if (moodValue === "okay") return "bg-primary/10";
    if (moodValue === "bad") return "bg-orange-500/10";
    if (moodValue === "terrible") return "bg-red-500/10";
    return "bg-primary/5";
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="grid grid-cols-7 gap-1">
        {days.map(
          ({ date, dateKey, completedTasks, dueTasks, overdueTasks, mood }) => {
            const MoodIcon = mood
              ? MOOD_OPTIONS.find((m) => m.value === mood.mood)?.icon
              : null;
            const dayIsToday = isToday(date);
            const isFuture = isAfter(date, new Date());
            const moodBgClass = getMoodBgClass(mood);
            const hasDueTasks = dueTasks.length > 0;
            const isClickable = !isFuture || hasDueTasks;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => onDayClick(date)}
                disabled={!isClickable}
                className={cn(
                  "flex flex-col items-center p-2 rounded-2xl transition-colors min-h-24",
                  isClickable && "hover:bg-primary/15 cursor-pointer",
                  !isClickable && "opacity-30 cursor-not-allowed",
                  dayIsToday && "ring-2 ring-primary",
                  isFuture ? "bg-primary/5" : moodBgClass,
                )}
              >
                <span className="text-xs">{format(date, "EEE")}</span>
                <span
                  className={cn(
                    "text-lg font-semibold",
                    dayIsToday && "text-primary",
                  )}
                >
                  {format(date, "d")}
                </span>

                <div className="flex flex-col items-center gap-1 mt-auto">
                  {MoodIcon && <MoodIcon className="size-5 text-primary" />}
                  {completedTasks.length > 0 && (
                    <div className="flex items-center gap-0.5 text-success">
                      <CheckCircleIcon className="size-4" />
                      <span className="text-xs font-medium">
                        {completedTasks.length}
                      </span>
                    </div>
                  )}
                  {overdueTasks.length > 0 && (
                    <div className="flex items-center gap-0.5 text-destructive">
                      <CalendarBlankIcon className="size-4" />
                      <span className="text-xs font-medium">
                        {overdueTasks.length}
                      </span>
                    </div>
                  )}
                  {dueTasks.length > 0 && (
                    <div className="flex items-center gap-0.5 text-amber-600">
                      <CalendarBlankIcon className="size-4" />
                      <span className="text-xs font-medium">
                        {dueTasks.length}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}
