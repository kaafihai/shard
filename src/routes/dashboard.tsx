import { createFileRoute } from "@tanstack/react-router";
import { useTasks } from "@/hooks/use-tasks";
import { useMoods } from "@/hooks/use-moods";
import { Spinner } from "@/components/ui/spinner";
import { ChartBarIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";

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
  level: ActivityLevel;
}

function DashboardPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: moods, isLoading: moodsLoading } = useMoods();

  const { activityData, weeks, stats, startDate } = useMemo(() => {
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

    const startDate = startOfWeek(earliestDate);
    const days = eachDayOfInterval({ start: startDate, end: today });

    // Build activity map
    const activityMap = new Map<string, { tasks: number; moods: number }>();

    tasks?.forEach((task) => {
      if (task.completedAt) {
        const key = formatDateKey(new Date(task.completedAt));
        const existing = activityMap.get(key) || { tasks: 0, moods: 0 };
        activityMap.set(key, { ...existing, tasks: existing.tasks + 1 });
      }
    });

    moods?.forEach((mood) => {
      const key = formatDateKey(new Date(mood.createdAt));
      const existing = activityMap.get(key) || { tasks: 0, moods: 0 };
      activityMap.set(key, { ...existing, moods: existing.moods + 1 });
    });

    // Calculate activity levels
    const activityData: DayActivity[] = days.map((date) => {
      const key = formatDateKey(date);
      const activity = activityMap.get(key) || { tasks: 0, moods: 0 };
      const total = activity.tasks + activity.moods;

      let level: ActivityLevel = 0;
      if (total >= 5) level = 4;
      else if (total >= 3) level = 3;
      else if (total >= 2) level = 2;
      else if (total >= 1) level = 1;

      return {
        date,
        tasksCompleted: activity.tasks,
        moodsLogged: activity.moods,
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
    const activeDays = activityData.filter((d) => d.level > 0).length;

    return {
      activityData,
      weeks,
      stats: { totalTasks, totalMoods, activeDays },
      startDate,
    };
  }, [tasks, moods]);

  if (tasksLoading || moodsLoading) {
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
        <StatBox label="Tasks Done" value={stats.totalTasks} />
        <StatBox label="Moods Logged" value={stats.totalMoods} />
        <StatBox label="Active Days" value={stats.activeDays} />
      </div>

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
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>{format(startDate, "MMM yyyy")}</span>
            <div className="flex items-center gap-2">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "size-3 rounded-sm",
                      getLevelColor(level as ActivityLevel)
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
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {day.tasksCompleted > 0 && (
                    <span>{day.tasksCompleted} task{day.tasksCompleted !== 1 ? "s" : ""}</span>
                  )}
                  {day.moodsLogged > 0 && (
                    <span>{day.moodsLogged} mood{day.moodsLogged !== 1 ? "s" : ""}</span>
                  )}
                </div>
              </div>
            ))}
          {activityData.filter((d) => d.level > 0).length === 0 && (
            <p className="text-center text-muted-foreground py-8">
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
        isToday && "ring-2 ring-foreground ring-offset-1 ring-offset-background"
      )}
      title={`${format(day.date, "MMM d, yyyy")}: ${day.tasksCompleted} tasks, ${day.moodsLogged} moods`}
    />
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-primary/10 rounded-2xl text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
