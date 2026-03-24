import { createFileRoute, Link } from "@tanstack/react-router";
import { useTasks } from "@/hooks/use-tasks";
import { useMoods } from "@/hooks/use-moods";
import { useHabits, useAllHabitEntries } from "@/hooks/use-habits";
import { Spinner } from "@/components/ui/spinner";
import { GardenOverlay } from "@/components/garden-scene";
import {
  TrendLineIcon,
  CompletedIcon,
  PendingIcon,
  CancelIcon,
  DateIcon,
} from "@/lib/icons";
import { useMemo, useState } from "react";
import { RabbitWardrobe } from "@/components/rabbit-wardrobe";
import { cn } from "@/lib/utils";
import type { Habit, HabitEntry, MoodLevel } from "@/lib/types";
import {
  format,
  startOfWeek,
  eachDayOfInterval,
  isSameDay,
  subDays,
  differenceInDays,
} from "date-fns";
import { MOOD_OPTIONS } from "@/components/mood-tracker-form";
import {
  RabbitMascot,
  RabbitXPBar,
  getGreetingMessage,
  getStreakCelebration,
  getDashboardEmptyMessage,
  getPersonalityMessage,
} from "@/components/rabbit-mascot";
import { useRabbitState, useRabbitMemories, useOutfitUnlockChecker } from "@/hooks/use-rabbit";
import type { RabbitLevel } from "@/lib/types";

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
  if (frequency === "DAILY") return true;
  if (frequency === "WEEKLY") {
    const daysMatch = rrule.match(/BYDAY=([A-Z,]+)/);
    const days = daysMatch ? daysMatch[1].split(",") : [];
    const dayOfWeek = DAY_MAP[date.getDay()];
    return days.includes(dayOfWeek);
  }
  return true;
}

function DashboardPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: moods, isLoading: moodsLoading } = useMoods();
  const { data: habits, isLoading: habitsLoading } = useHabits(true);
  const { data: habitEntries, isLoading: habitEntriesLoading } =
    useAllHabitEntries();
  const { data: rabbitState } = useRabbitState();
  const { data: rabbitMemories } = useRabbitMemories();
  useOutfitUnlockChecker();

  // Stable greeting message (computed once per mount)
  const [greeting] = useState(() => getGreetingMessage());
  const [wardrobeOpen, setWardrobeOpen] = useState(false);

  const completedTasks = tasks?.filter((t) => t.completedAt) ?? [];
  const activeTasks = tasks?.filter((t) => !t.completedAt && !t.archivedAt) ?? [];

  // Tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tasksDueToday = activeTasks.filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due.getTime() <= today.getTime();
  });

  // Habits scheduled today
  const todayStr = formatDateKey(new Date());
  const activeHabits = (habits ?? []).filter((h) => !h.archivedAt && !h.pausedAt);
  const habitsScheduledToday = activeHabits.filter((h) => isDateScheduled(new Date(), h.rrule));
  const habitsCompletedToday = habitsScheduledToday.filter((h) => {
    return habitEntries?.some(
      (e) => e.habitId === h.id && e.date === todayStr && e.status === "completed"
    );
  });

  // Mood stats
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

  // Recent moods for sparkline (last 7 days)
  const recentMoods = useMemo(() => {
    if (!moods) return [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return formatDateKey(d);
    });
    return last7Days.map((dateKey) => {
      const dayMoods = moods.filter((m) => formatDateKey(new Date(m.createdAt)) === dateKey);
      if (dayMoods.length === 0) return null;
      // Return the last mood of the day
      return dayMoods[dayMoods.length - 1].mood;
    });
  }, [moods]);

  // Calculate best current streak across all habits
  const bestStreak = useMemo(() => {
    if (!habits || !habitEntries) return { streak: 0, habit: null as Habit | null };
    let best = 0;
    let bestHabit: Habit | null = null;

    for (const habit of activeHabits) {
      const entries = habitEntries.filter((e) => e.habitId === habit.id);
      let streak = 0;
      const now = new Date();
      let checkDate = now;
      while (true) {
        const dateString = format(checkDate, "yyyy-MM-dd");
        const isScheduled = isDateScheduled(checkDate, habit.rrule);
        if (isScheduled) {
          const entry = entries.find(
            (e) => e.date === dateString && e.status === "completed"
          );
          if (entry) {
            streak++;
          } else if (!isSameDay(checkDate, now)) {
            break;
          }
        }
        checkDate = subDays(checkDate, 1);
        if (differenceInDays(now, checkDate) > 365) break;
      }
      if (streak > best) {
        best = streak;
        bestHabit = habit;
      }
    }
    return { streak: best, habit: bestHabit };
  }, [habits, habitEntries, activeHabits]);

  const streakCelebration = bestStreak.streak > 0
    ? getStreakCelebration(bestStreak.streak)
    : null;

  const { activityData, weeks, startDate } = useMemo(() => {
    const today = new Date();
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

    const activityMap = new Map<string, { tasks: number; moods: number; habits: number }>();
    tasks?.forEach((task) => {
      if (task.completedAt) {
        const key = formatDateKey(new Date(task.completedAt));
        const existing = activityMap.get(key) || { tasks: 0, moods: 0, habits: 0 };
        activityMap.set(key, { ...existing, tasks: existing.tasks + 1 });
      }
    });
    moods?.forEach((mood) => {
      const key = formatDateKey(new Date(mood.createdAt));
      const existing = activityMap.get(key) || { tasks: 0, moods: 0, habits: 0 };
      activityMap.set(key, { ...existing, moods: existing.moods + 1 });
    });
    habitEntries?.forEach((entry) => {
      if (entry.status === "completed") {
        const key = entry.date;
        const existing = activityMap.get(key) || { tasks: 0, moods: 0, habits: 0 };
        activityMap.set(key, { ...existing, habits: existing.habits + 1 });
      }
    });

    const activityData: DayActivity[] = days.map((date) => {
      const key = formatDateKey(date);
      const activity = activityMap.get(key) || { tasks: 0, moods: 0, habits: 0 };
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

    const weeks: DayActivity[][] = [];
    for (let i = 0; i < activityData.length; i += 7) {
      weeks.push(activityData.slice(i, i + 7));
    }

    return { activityData, weeks, startDate };
  }, [tasks, moods, habitEntries]);

  if (tasksLoading || moodsLoading || habitsLoading || habitEntriesLoading) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  const hasActivity = activityData.some((d) => d.level > 0);

  return (
    <div className="mx-auto space-y-6 relative">
      {/* Garden overlay at bottom */}
      <GardenOverlay className="z-0 opacity-60" />

      {/* Explainer */}
      <div className="p-4 rounded-2xl bg-primary/5 space-y-2">
        <p className="text-xs font-semibold opacity-50">How Dashboard works</p>
        <p className="text-xs leading-relaxed opacity-40">
          This is your home base. Your rabbit companion levels up as you
          complete tasks and habits — tap it to open the wardrobe. The activity
          grid shows your streak at a glance, and Today's Focus highlights
          what's due right now. Everything stays on your device, always private.
        </p>
      </div>

      {/* Rabbit Greeting */}
      <RabbitWardrobe open={wardrobeOpen} onOpenChange={setWardrobeOpen} />
      <div className="p-5 rounded-4xl space-y-3" style={{ background: "var(--accent-warm-subtle)" }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setWardrobeOpen(true)}
            className="cursor-pointer hover:scale-105 transition-transform"
            title="Open wardrobe"
          >
            <RabbitMascot
              mood={greeting.mood}
              size="lg"
              showBubble={false}
              level={(rabbitState?.level ?? 1) as RabbitLevel}
              outfit={rabbitState?.currentOutfit ?? "none"}
            />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-sm mt-1 opacity-80">
              {(() => {
                const personalityMsg = getPersonalityMessage(rabbitMemories ?? []);
                return personalityMsg ? personalityMsg.message : greeting.message;
              })()}
            </p>
          </div>
        </div>
        {rabbitState && (
          <RabbitXPBar
            level={rabbitState.level as RabbitLevel}
            xp={rabbitState.xp}
          />
        )}
      </div>

      {/* Today's Focus */}
      {(tasksDueToday.length > 0 || habitsScheduledToday.length > 0) && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Today's Focus</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-3xl" style={{ background: "var(--accent-warm-subtle)" }}>
              <div className="flex items-center gap-2 mb-1">
                <DateIcon className="size-4" style={{ color: "var(--accent-warm-strong)" }} />
                <span className="text-sm font-medium">Tasks Due</span>
              </div>
              <p className="text-2xl font-bold">{tasksDueToday.length}</p>
              <p className="text-xs opacity-70">
                {tasksDueToday.length === 0 ? "All clear!" : "to handle today"}
              </p>
            </div>
            <div className="p-4 bg-success/10 rounded-3xl">
              <div className="flex items-center gap-2 mb-1">
                <CompletedIcon className="size-4 text-success" />
                <span className="text-sm font-medium">Habits</span>
              </div>
              <p className="text-2xl font-bold">
                {habitsCompletedToday.length}/{habitsScheduledToday.length}
              </p>
              <p className="text-xs opacity-70">
                {habitsCompletedToday.length === habitsScheduledToday.length && habitsScheduledToday.length > 0
                  ? "All done!"
                  : "completed today"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Streak Spotlight */}
      {bestStreak.streak >= 3 && bestStreak.habit && streakCelebration && (
        <section className="p-5 rounded-4xl bg-success/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Streak Spotlight</h3>
              <p className="text-sm opacity-80">{bestStreak.habit.title}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-success">{bestStreak.streak}</p>
              <p className="text-xs opacity-70">day streak</p>
            </div>
          </div>
          <RabbitMascot
            mood={streakCelebration.mood}
            message={streakCelebration.message}
            size="sm"
            level={(rabbitState?.level ?? 1) as RabbitLevel}
            outfit={rabbitState?.currentOutfit ?? "none"}
          />
        </section>
      )}

      {/* Mood Sparkline */}
      {moods && moods.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Mood This Week</h3>
          <div className="flex items-center justify-between p-4 bg-primary/8 rounded-3xl">
            {recentMoods.map((mood, i) => {
              const date = subDays(new Date(), 6 - i);
              const MoodIcon = mood ? MOOD_OPTIONS.find((m) => m.value === mood)?.icon : null;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xs opacity-60">{format(date, "EEE")}</span>
                  <div className={cn(
                    "size-9 rounded-full flex items-center justify-center",
                    mood ? "bg-primary/10" : "bg-primary/5",
                    isSameDay(date, new Date()) && "ring-2 ring-primary/30"
                  )}>
                    {MoodIcon ? (
                      <MoodIcon className="size-5" />
                    ) : (
                      <span className="text-xs opacity-30">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {MostFrequentMoodIcon && mostFrequentMood && (
            <div className="flex items-center gap-2 text-sm px-1">
              <MostFrequentMoodIcon className="size-4" />
              <span>Top mood: <strong className="capitalize">{mostFrequentMood}</strong> ({moodCounts[mostFrequentMood]} times)</span>
            </div>
          )}
        </section>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<CompletedIcon className="hidden sm:block size-5" />}
          label="Tasks Done"
          value={completedTasks.length}
          sublabel={`${activeTasks.length} active`}
        />
        <StatCard
          icon={<TrendLineIcon className="hidden sm:block size-5" />}
          label="Moods"
          value={moods?.length ?? 0}
          sublabel="logged"
        />
        <StatCard
          icon={<PendingIcon className="hidden sm:block size-5" />}
          label="Best Streak"
          value={bestStreak.streak}
          sublabel="days"
        />
      </div>

      {/* Habits This Week */}
      {habits && habits.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Habits This Week</h3>
          <div className="space-y-3">
            <div className="bg-primary/8 p-6 rounded-4xl flex flex-row justify-between gap-2">
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
                    <div className="size-8 rounded-full flex items-center justify-center text-xs">
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
                entries={habitEntries?.filter((e) => e.habitId === habit.id) ?? []}
              />
            ))}
          </div>
        </section>
      )}

      {/* Activity Heatmap */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Activity</h3>
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

      {/* Recent Activity */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <div className="space-y-2">
          {activityData
            .filter((d) => d.level > 0)
            .reverse()
            .slice(0, 7)
            .map((day) => (
              <div
                key={day.date.toISOString()}
                className="flex items-center justify-between p-3 bg-primary/8 rounded-2xl"
              >
                <span className="font-medium">
                  {isSameDay(day.date, new Date())
                    ? "Today"
                    : format(day.date, "EEE, MMM d")}
                </span>
                <div className="flex gap-4 text-sm">
                  {day.tasksCompleted > 0 && (
                    <span>
                      {day.tasksCompleted} task{day.tasksCompleted !== 1 ? "s" : ""}
                    </span>
                  )}
                  {day.habitsCompleted > 0 && (
                    <span>
                      {day.habitsCompleted} habit{day.habitsCompleted !== 1 ? "s" : ""}
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
          {!hasActivity && (
            <div className="text-center py-6">
              <RabbitMascot
                mood="waving"
                message={getDashboardEmptyMessage().message}
                size="md"
                className="justify-center"
                level={(rabbitState?.level ?? 1) as RabbitLevel}
                outfit={rabbitState?.currentOutfit ?? "none"}
              />
            </div>
          )}
        </div>
      </section>

      {/* About Baajit */}
      <section className="p-4 rounded-3xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 space-y-2">
        <p className="text-xs font-semibold text-orange-900 opacity-60">About Baajit</p>
        <p className="text-sm text-orange-900 leading-relaxed mb-3">
          Built for neurodivergent minds by Sharada. Learn the story behind every feature.
        </p>
        <Link
          to="/about"
          className="inline-block text-sm font-medium text-orange-700 hover:text-orange-900 underline"
        >
          Read the full story →
        </Link>
      </section>

    </div>
  );
}

function getLevelColor(level: ActivityLevel): string {
  switch (level) {
    case 0:
      return "bg-success/10";
    case 1:
      return "bg-success/30";
    case 2:
      return "bg-success/50";
    case 3:
      return "bg-success/70";
    case 4:
      return "bg-success";
  }
}

function HeatmapCell({ day }: { day: DayActivity }) {
  const isToday = isSameDay(day.date, new Date());
  return (
    <div
      className={cn(
        "size-5 rounded-sm transition-colors",
        getLevelColor(day.level),
        isToday && "ring-2 ring-foreground ring-offset-1 ring-offset-background",
      )}
      title={`${format(day.date, "MMM d, yyyy")}: ${day.tasksCompleted} tasks, ${day.habitsCompleted} habits, ${day.moodsLogged} moods`}
    />
  );
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
        entry,
        isCompleted: entry?.status === "completed",
        isSkipped: entry?.status === "skipped",
        isScheduled,
        isToday: isSameDay(date, today),
      };
    });
  }, [entries, today, habit.rrule]);

  const scheduledDays = weekDays.filter((d) => d.isScheduled);
  const completedCount = weekDays.filter((d) => d.isCompleted).length;

  return (
    <Link
      to="/habits/$id/stats"
      params={{ id: habit.id }}
      className="block p-6 bg-primary/8 rounded-4xl w-full text-left hover:bg-primary/12 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">{habit.title}</h4>
        <span className="text-sm opacity-70">
          {completedCount}/{scheduledDays.length} this week
        </span>
      </div>
      <div className="flex gap-2 justify-between">
        {weekDays.map((day) => (
          <div key={day.dateString} className="flex flex-col items-center gap-1 px-2">
            <div
              className={cn(
                "size-8 rounded-full flex items-center opacity-80 justify-center text-xs font-medium transition-colors",
                !day.entry && "!opacity-40",
              )}
            >
              {day.isCompleted ? (
                <CompletedIcon className="size-8" />
              ) : day.isSkipped ? (
                <CancelIcon className="size-8" />
              ) : (
                <PendingIcon className="size-8" />
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
    <div className="p-4 bg-primary/8 rounded-3xl space-y-2">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold capitalize">{value}</p>
      <p className="text-sm opacity-70">{sublabel}</p>
    </div>
  );
}
