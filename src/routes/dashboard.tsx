import { createFileRoute, Link } from "@tanstack/react-router";
import { useTasks } from "@/hooks/use-tasks";
import { useMoods } from "@/hooks/use-moods";
import { useHabits, useAllHabitEntries } from "@/hooks/use-habits";
import { Spinner } from "@/components/ui/spinner";
import {
  ChartBarIcon,
  ChartLineUpIcon,
  CheckCircleIcon,
  CircleDashedIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Habit, HabitEntry, MoodLevel } from "@/lib/types";
import {
  format,
  startOfWeek,
  eachDayOfInterval,
  isSameDay,
  subDays,
} from "date-fns";
import { MOOD_OPTIONS } from "@/components/mood-tracker-form";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function formatDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

type ActivityLevel = 0 | 1 | 2 | 3 | 4;

interface DayActivity {
  date: Date;
  tasksCompleted: number;
  moodsLogged: number;
  habitsCompleted: number;
  level: ActivityLevel;
}

function DashboardPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: moods, isLoading: moodsLoading } = useMoods();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: habitEntries, isLoading: habitEntriesLoading } =
    useAllHabitEntries();

  const completedTasks = tasks?.filter((t) => t.completedAt) ?? [];
  const activeTasks = tasks?.filter((t) => !t.completedAt) ?? [];
  // Calculate mood stats
  const moodCounts = (moods ?? []).reduce(
    (acc, mood) => {
      acc[mood.mood] = (acc[mood.mood] || 0) + 1;
      return acc;
    },
    {} as Record<MoodLevel, number>,
  );

  const mostFrequentMood = Object.entries(moodCounts).sort(
    ([, a], [, b]) => b - a,
  )[0]?.[0] as MoodLevel | undefined;

  const MostFrequentMoodIcon = MOOD_OPTIONS.find(
    (m) => m.value === mostFrequentMood,
  )?.icon;

  const { activityData, weeks, startDate } = useMemo(() => {
    const today = new Date();

    // Find the earliest activity date
    let earliestDate = today;

    tasks?.forEach((task) => {
      const createdAt = new Date(task.createdAt);
      if (createdAt < earliestDate) earliestDate = createdAt;
    });

    moods?.forEach((mood) => {
      const createdAt = new Date(mood.createdAt);
      if (createdAt < earliestDate) earliestDate = createdAt;
    });

    habitEntries?.forEach((entry) => {
      const date = new Date(entry.date);
      if (date < earliestDate) earliestDate = date;
    });

    const startDate = startOfWeek(earliestDate);
    const days = eachDayOfInterval({ start: startDate, end: today });

    // Build activity map
    const activityMap = new Map<
      string,
      { tasks: number; moods: number; habits: number }
    >();

    tasks?.forEach((task) => {
      if (task.completedAt) {
        const key = formatDateKey(new Date(task.completedAt));
        const existing = activityMap.get(key) || {
          tasks: 0,
          moods: 0,
          habits: 0,
        };
        activityMap.set(key, { ...existing, tasks: existing.tasks + 1 });
      }
    });

    moods?.forEach((mood) => {
      const key = formatDateKey(new Date(mood.createdAt));
      const existing = activityMap.get(key) || {
        tasks: 0,
        moods: 0,
        habits: 0,
      };
      activityMap.set(key, { ...existing, moods: existing.moods + 1 });
    });

    habitEntries?.forEach((entry) => {
      if (entry.status === "completed") {
        const key = entry.date;
        const existing = activityMap.get(key) || {
          tasks: 0,
          moods: 0,
          habits: 0,
        };
        activityMap.set(key, { ...existing, habits: existing.habits + 1 });
      }
    });

    // Calculate activity levels
    const activityData: DayActivity[] = days.map((date) => {
      const key = formatDateKey(date);
      const activity = activityMap.get(key) || {
        tasks: 0,
        moods: 0,
        habits: 0,
      };
      const total = activity.tasks + activity.moods + activity.habits;

      let level: ActivityLevel = 0;
      if (total >= 5) level = 4;
      else if (total >= 3) level = 3;
      else if (total >= 2) level = 2;
      else if (total >= 1) level = 1;

      return {
        date,
        tasksCompleted: activity.tasks,
        moodsLogged: activity.moods,
        habitsCompleted: activity.habits,
        level,
      };
    });

    // Group into weeks
    const weeks: DayActivity[][] = [];
    for (let i = 0; i < activityData.length; i += 7) {
      weeks.push(activityData.slice(i, i + 7));
    }

    // Calculate stats
    const totalTasks = tasks?.filter((t) => t.completedAt).length ?? 0;
    const totalMoods = moods?.length ?? 0;
    const totalHabits =
      habitEntries?.filter((e) => e.status === "completed").length ?? 0;
    const activeDays = activityData.filter((d) => d.level > 0).length;

    return {
      activityData,
      weeks,
      stats: { totalTasks, totalMoods, totalHabits, activeDays },
      startDate,
    };
  }, [tasks, moods, habitEntries]);

  if (tasksLoading || moodsLoading || habitsLoading || habitEntriesLoading) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ChartBarIcon className="size-8" />
        <h2 className="text-3xl font-bold">Dashboard</h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<CheckCircleIcon className="size-6" />}
          label="Tasks Completed"
          value={completedTasks.length}
          sublabel={`${activeTasks.length} active`}
        />
        <StatCard
          icon={<ChartLineUpIcon className="size-6" />}
          label="Moods Logged"
          value={moods?.length ?? 0}
          sublabel="total entries"
        />
        {MostFrequentMoodIcon && mostFrequentMood && (
          <StatCard
            icon={<MostFrequentMoodIcon className="size-6" />}
            label="Top Mood"
            value={mostFrequentMood}
            sublabel={`${moodCounts[mostFrequentMood]} times`}
          />
        )}
      </div>

      {habits && habits.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xl font-semibold">Habits This Week</h3>
          <div className="space-y-4">
            <div className="bg-primary/10 p-8 rounded-4xl flex flex-row justify-between gap-2">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = subDays(new Date(), 6 - i);
                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-2xl p-2",
                      i === 6
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-foreground",
                    )}
                  >
                    <span className="text-sm">{format(date, "EEE")}</span>
                    <div
                      className={cn(
                        "size-8 rounded-full flex items-center justify-center text-xs",
                      )}
                    >
                      {format(date, "d")}
                    </div>
                  </div>
                );
              })}
            </div>
            {habits.map((habit) => (
              <HabitWeeklyView
                key={habit.id}
                habit={habit}
                entries={
                  habitEntries?.filter((e) => e.habitId === habit.id) ?? []
                }
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Activity</h3>
        <div className="p-4 bg-primary/5 rounded-3xl overflow-x-auto">
          <div className="flex gap-1 min-w-fit">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day) => (
                  <HeatmapCell key={day.date.toISOString()} day={day} />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-sm">
            <span>{format(startDate, "MMM yyyy")}</span>
            <div className="flex items-center gap-2">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "size-3 rounded-sm",
                      getLevelColor(level as ActivityLevel),
                    )}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
            <span>{format(new Date(), "MMM yyyy")}</span>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold">Recent Activity</h3>
        <div className="space-y-2">
          {activityData
            .filter((d) => d.level > 0)
            .reverse()
            .slice(0, 7)
            .map((day) => (
              <div
                key={day.date.toISOString()}
                className="flex items-center justify-between p-3 bg-primary/10 rounded-2xl"
              >
                <span className="font-medium">
                  {isSameDay(day.date, new Date())
                    ? "Today"
                    : format(day.date, "EEE, MMM d")}
                </span>
                <div className="flex gap-4 text-sm">
                  {day.tasksCompleted > 0 && (
                    <span>
                      {day.tasksCompleted} task
                      {day.tasksCompleted !== 1 ? "s" : ""}
                    </span>
                  )}
                  {day.habitsCompleted > 0 && (
                    <span>
                      {day.habitsCompleted} habit
                      {day.habitsCompleted !== 1 ? "s" : ""}
                    </span>
                  )}
                  {day.moodsLogged > 0 && (
                    <span>
                      {day.moodsLogged} mood{day.moodsLogged !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          {activityData.filter((d) => d.level > 0).length === 0 && (
            <p className="text-center py-8">
              No activity yet. Start by logging a mood or completing a task!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function getLevelColor(level: ActivityLevel): string {
  switch (level) {
    case 0:
      return "bg-primary/10";
    case 1:
      return "bg-primary/30";
    case 2:
      return "bg-primary/50";
    case 3:
      return "bg-primary/70";
    case 4:
      return "bg-primary";
  }
}

function HeatmapCell({ day }: { day: DayActivity }) {
  const isToday = isSameDay(day.date, new Date());

  return (
    <div
      className={cn(
        "size-4 rounded-sm transition-colors",
        getLevelColor(day.level),
        isToday &&
          "ring-2 ring-foreground ring-offset-1 ring-offset-background",
      )}
      title={`${format(day.date, "MMM d, yyyy")}: ${day.tasksCompleted} tasks, ${day.habitsCompleted} habits, ${day.moodsLogged} moods`}
    />
  );
}

const DAY_MAP: Record<number, string> = {
  0: "SU",
  1: "MO",
  2: "TU",
  3: "WE",
  4: "TH",
  5: "FR",
  6: "SA",
};

function isDateScheduled(date: Date, rrule: string): boolean {
  const freqMatch = rrule.match(/FREQ=(\w+)/);
  const frequency = freqMatch?.[1] || "DAILY";

  if (frequency === "DAILY") {
    return true;
  }

  if (frequency === "WEEKLY") {
    const daysMatch = rrule.match(/BYDAY=([A-Z,]+)/);
    const days = daysMatch ? daysMatch[1].split(",") : [];
    const dayOfWeek = DAY_MAP[date.getDay()];
    return days.includes(dayOfWeek);
  }

  // For MONTHLY, just check if it's the same day of month as today (simplified)
  return true;
}

function HabitWeeklyView({
  habit,
  entries,
}: {
  habit: Habit;
  entries: HabitEntry[];
}) {
  const today = new Date();
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateString = format(date, "yyyy-MM-dd");
      const entry = entries.find((e) => e.date === dateString);
      const isScheduled = isDateScheduled(date, habit.rrule);
      return {
        date,
        dateString,
        isCompleted: entry?.status === "completed",
        isScheduled,
        isToday: isSameDay(date, today),
      };
    });
  }, [entries, today, habit.rrule]);

  const scheduledDays = weekDays.filter((d) => d.isScheduled);
  const completedCount = scheduledDays.filter((d) => d.isCompleted).length;

  return (
    <Link
      to="/habits/$id/stats"
      params={{ id: habit.id }}
      className="block p-8 bg-primary/10 rounded-4xl w-full text-left hover:bg-primary/15 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{habit.title}</h4>
        <span className="text-sm text-muted">
          {completedCount}/{scheduledDays.length} this week
        </span>
      </div>
      <div className="flex gap-2 justify-between">
        {weekDays.map((day) => (
          <div
            key={day.dateString}
            className="flex flex-col items-center gap-1 px-2"
          >
            <div
              className={cn(
                "size-8 rounded-full flex items-center opacity-80 justify-center text-xs font-medium transition-colors",
                day.isScheduled ? "" : "!opacity-40",
              )}
            >
              {day.isCompleted ? (
                <CheckCircleIcon className="size-8" />
              ) : day.isScheduled ? (
                <XCircleIcon className="size-8" />
              ) : (
                <CircleDashedIcon className="size-8" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}

function StatCard({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel: string;
}) {
  return (
    <div className="p-4 bg-primary/10 rounded-3xl space-y-2">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold capitalize">{value}</p>
      <p className="text-sm">{sublabel}</p>
    </div>
  );
}
