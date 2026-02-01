import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useHabitById, useAllHabitEntries } from "@/hooks/use-habits";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useMemo } from "react";
import type { HabitEntry } from "@/lib/types";
import {
  format,
  differenceInDays,
  subDays,
  isSameDay,
  isAfter,
} from "date-fns";

export const Route = createFileRoute("/habits/$id/stats")({
  component: HabitStatsPage,
});

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

  return true;
}

function HabitStatsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: habit, isLoading: habitLoading } = useHabitById(id);
  const { data: allEntries, isLoading: entriesLoading } = useAllHabitEntries();

  const entries = useMemo(() => {
    return allEntries?.filter((e) => e.habitId === id) ?? [];
  }, [allEntries, id]);

  const stats = useMemo(() => {
    if (!habit) return null;

    const completedEntries = entries.filter((e) => e.status === "completed");
    const totalCompleted = completedEntries.length;

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    let checkDate = today;

    while (true) {
      const dateString = format(checkDate, "yyyy-MM-dd");
      const isScheduled = isDateScheduled(checkDate, habit.rrule);

      if (isScheduled) {
        const entry = entries.find(
          (e) => e.date === dateString && e.status === "completed",
        );
        if (entry) {
          currentStreak++;
        } else if (!isSameDay(checkDate, today)) {
          break;
        }
      }

      checkDate = subDays(checkDate, 1);

      if (differenceInDays(today, checkDate) > 365) break;
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedEntries = [...completedEntries].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);

      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedEntries[i - 1].date);
        const daysBetween = differenceInDays(entryDate, prevDate);
        let missedScheduled = false;

        for (let d = 1; d < daysBetween; d++) {
          const betweenDate = subDays(entryDate, d);
          if (isDateScheduled(betweenDate, habit.rrule)) {
            missedScheduled = true;
            break;
          }
        }

        if (missedScheduled) {
          tempStreak = 1;
        } else {
          tempStreak++;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    const daysSinceCreated = differenceInDays(today, new Date(habit.createdAt));

    return {
      totalCompleted,
      currentStreak,
      longestStreak,
      daysSinceCreated,
    };
  }, [habit, entries]);

  if (habitLoading || entriesLoading) {
    return (
      <Dialog open onOpenChange={() => navigate({ to: "/dashboard" })}>
        <DialogContent>
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!habit || !stats) {
    return (
      <Dialog open onOpenChange={() => navigate({ to: "/dashboard" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Habit not found</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={() => navigate({ to: "/dashboard" })}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{habit.title}</DialogTitle>
          {habit.description && (
            <DialogDescription>{habit.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl text-center">
            <p className="text-2xl font-bold">{stats.totalCompleted}</p>
            <p className="text-sm">Total Completions</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-center">
            <p className="text-2xl font-bold">{stats.currentStreak}</p>
            <p className="text-sm">Current Streak</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-center">
            <p className="text-2xl font-bold">{stats.longestStreak}</p>
            <p className="text-sm">Longest Streak</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-center">
            <p className="text-2xl font-bold">{stats.daysSinceCreated}</p>
            <p className="text-sm">Days Tracked</p>
          </div>
        </div>

        <CompletionCalendar entries={entries} rrule={habit.rrule} />

        <div className="text-sm">
          Started {format(new Date(habit.createdAt), "MMMM d, yyyy")}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CompletionCalendar({
  entries,
  rrule,
}: {
  entries: HabitEntry[];
  rrule: string;
}) {
  const today = new Date();

  const completedDates = useMemo(() => {
    return entries
      .filter((e) => e.status === "completed")
      .map((e) => new Date(e.date));
  }, [entries]);

  const notScheduledMatcher = (date: Date) => {
    return !isDateScheduled(date, rrule) || isAfter(date, today);
  };

  return (
    <Calendar
      mode="multiple"
      className="w-full"
      selected={completedDates}
      disabled={notScheduledMatcher}
      modifiers={{
        completed: completedDates,
      }}
      modifiersClassNames={{
        completed: "bg-success !text-success-foreground",
      }}
    />
  );
}
