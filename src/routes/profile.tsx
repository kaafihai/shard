import { createFileRoute } from "@tanstack/react-router";
import { useTasks } from "@/hooks/use-tasks";
import { useMoods } from "@/hooks/use-moods";
import { Spinner } from "@/components/ui/spinner";
import { MOOD_OPTIONS } from "@/components/mood-tracker-form";
import {
  UserIcon,
  CheckCircleIcon,
  FireIcon,
  ChartLineUpIcon,
} from "@phosphor-icons/react";
import type { MoodLevel } from "@/lib/types";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: moods, isLoading: moodsLoading } = useMoods();

  if (tasksLoading || moodsLoading) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  const completedTasks = tasks?.filter((t) => t.completedAt) ?? [];
  const activeTasks = tasks?.filter((t) => !t.completedAt) ?? [];

  // Calculate mood stats
  const moodCounts = (moods ?? []).reduce(
    (acc, mood) => {
      acc[mood.mood] = (acc[mood.mood] || 0) + 1;
      return acc;
    },
    {} as Record<MoodLevel, number>
  );

  const mostFrequentMood = Object.entries(moodCounts).sort(
    ([, a], [, b]) => b - a
  )[0]?.[0] as MoodLevel | undefined;

  const MostFrequentMoodIcon = MOOD_OPTIONS.find(
    (m) => m.value === mostFrequentMood
  )?.icon;

  // Calculate streak (consecutive days with mood logged)
  const sortedMoods = [...(moods ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let streak = 0;
  if (sortedMoods.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);
    for (const mood of sortedMoods) {
      const moodDate = new Date(mood.createdAt);
      moodDate.setHours(0, 0, 0, 0);

      if (moodDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (moodDate.getTime() < checkDate.getTime()) {
        break;
      }
    }
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <UserIcon className="size-8" />
        <h2 className="text-3xl font-bold">Profile</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={<CheckCircleIcon className="size-6" />}
          label="Tasks Completed"
          value={completedTasks.length}
          sublabel={`${activeTasks.length} active`}
        />
        <StatCard
          icon={<FireIcon className="size-6" />}
          label="Day Streak"
          value={streak}
          sublabel="consecutive days"
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

      {moods && moods.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xl font-semibold">Recent Moods</h3>
          <div className="space-y-2">
            {sortedMoods.slice(0, 5).map((mood) => {
              const MoodIcon = MOOD_OPTIONS.find(
                (m) => m.value === mood.mood
              )?.icon;
              const moodLabel = MOOD_OPTIONS.find(
                (m) => m.value === mood.mood
              )?.label;
              return (
                <div
                  key={mood.id}
                  className="flex items-center gap-3 p-3 bg-primary/10 rounded-2xl"
                >
                  {MoodIcon && <MoodIcon className="size-6 text-primary" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{moodLabel}</p>
                    {mood.note && (
                      <p className="text-sm text-muted-foreground truncate">
                        {mood.note}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(mood.createdAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
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
      <p className="text-sm text-muted-foreground">{sublabel}</p>
    </div>
  );
}
