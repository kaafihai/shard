import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useTasks, useToggleTask } from "@/hooks/use-tasks";
import {
  useHabits,
  useHabitEntriesByDate,
  useToggleHabitEntry,
  getTodayDateString,
} from "@/hooks/use-habits";
import { useTodaysMood } from "@/hooks/use-moods";
import { Button, ButtonLink } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  DateIcon,
  CheckIcon,
  HabitIcon,
  AddIcon,
} from "@/lib/icons";
import { format } from "date-fns";
import type { Task, Habit, HabitEntry } from "@/lib/types";

const DAY_MAP: Record<number, string> = {
  0: "SU",
  1: "MO",
  2: "TU",
  3: "WE",
  4: "TH",
  5: "FR",
  6: "SA",
};

const DAY_LABELS: Record<string, string> = {
  SU: "Sun",
  MO: "Mon",
  TU: "Tue",
  WE: "Wed",
  TH: "Thu",
  FR: "Fri",
  SA: "Sat",
};
const WEEKDAYS = ["MO", "TU", "WE", "TH", "FR"];
const WEEKENDS = ["SA", "SU"];
const ALL_DAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

function formatRRule(rrule: string): string {
  const freqMatch = rrule.match(/FREQ=(\w+)/);
  const frequency = freqMatch?.[1] || "DAILY";

  if (frequency === "DAILY") return "Every day";

  if (frequency === "WEEKLY") {
    const daysMatch = rrule.match(/BYDAY=([A-Z,]+)/);
    const days = daysMatch ? daysMatch[1].split(",") : [];
    if (days.length === 0) return "Weekly";
    const sorted = ALL_DAYS.filter((d) => days.includes(d));
    if (sorted.length === 7) return "Every day";
    if (sorted.length === 5 && WEEKDAYS.every((d) => days.includes(d)))
      return "Weekdays";
    if (sorted.length === 2 && WEEKENDS.every((d) => days.includes(d)))
      return "Weekends";
    return sorted.map((d) => DAY_LABELS[d]).join(", ");
  }

  return rrule;
}

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

export const Route = createFileRoute("/")({
  component: TasksComponent,
});

function ListItem({
  completed,
  onToggle,
  title,
  description,
  metadata,
  actions,
  disabled,
  onClick,
}: {
  completed: boolean;
  onToggle: () => void;
  title: string;
  disabled?: boolean;
  description?: string;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      data-completed={completed}
      className="flex bg-primary/5 data-[completed=true]:bg-success/10 items-center gap-4 p-4 rounded-4xl transition-colors"
    >
      <div
        className="flex-1 min-w-0 order-1 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClick}
      >
        <h3 className={`font-semibold ${completed ? "opacity-70" : ""}`}>
          {title}
        </h3>
        {description && <p className="text-sm mt-1">{description}</p>}
        {metadata}
      </div>
      {actions && (
        <div className="flex items-center gap-1 order-2">
          {actions}
        </div>
      )}

      {!disabled && (
        <Button
          size="icon"
          variant={completed ? "ghost" : "success"}
          disabled={completed}
          onClick={onToggle}
          className="order-3"
        >
          <CheckIcon />
        </Button>
      )}
    </div>
  );
}

function HabitItem({
  habit,
  entry,
  onToggle,
  onEdit,
}: {
  habit: Habit;
  entry: HabitEntry | null;
  onToggle: (habit: Habit, entry: HabitEntry | null) => void;
  onEdit: (habit: Habit) => void;
}) {
  const isCompleted = entry?.status === "completed";

  return (
    <ListItem
      completed={isCompleted}
      onToggle={() => onToggle(habit, entry)}
      title={habit.title}
      description={habit.description}
      disabled={entry?.status === "cancelled"}
      onClick={() => onEdit(habit)}
      metadata={
        <p className="text-sm mt-1 flex items-center gap-1">
          <HabitIcon className="size-3" />
          {formatRRule(habit.rrule)}
        </p>
      }
    />
  );
}

function TaskItem({
  task,
  onToggle,
  onEdit,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
}) {
  const isCompleted = Boolean(task.completedAt);
  const isCancelled = Boolean(task.cancelledAt);
  const isPast =
    task.dueDate && !task.completedAt && new Date(task.dueDate) < new Date();

  return (
    <ListItem
      completed={isCompleted}
      onToggle={() => onToggle(task)}
      title={task.title}
      description={task.description}
      disabled={isCancelled}
      onClick={() => onEdit(task)}
      metadata={
        task.dueDate ? (
          <p
            data-past={isPast}
            className="text-sm data-[past=true]:text-destructive mt-1 flex items-center gap-1"
          >
            <DateIcon className="size-3" />
            {format(new Date(task.dueDate), "PPP")}
          </p>
        ) : undefined
      }
    />
  );
}

function TasksComponent() {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: habits = [], isLoading: isHabitsLoading } = useHabits();
  const todayDate = getTodayDateString();
  const { data: todayEntries = [] } = useHabitEntriesByDate(todayDate);
  const {
    data: todaysMood,
    isLoading: isMoodLoading,
    isFetching: isMoodFetching,
  } = useTodaysMood();
  const [filter, setFilter] = useState<"active" | "completed" | "all">("all");
  const toggleTask = useToggleTask();
  const toggleHabitEntry = useToggleHabitEntry();

  useEffect(() => {
    if (!isMoodLoading && !isMoodFetching && todaysMood === null) {
      navigate({ to: "/mood/track" });
    }
  }, [todaysMood, isMoodLoading, isMoodFetching, navigate]);

  const todaysHabits = useMemo(() => {
    const today = new Date();
    return habits.filter((habit) => isDateScheduled(today, habit.rrule));
  }, [habits]);

  const getEntryForHabit = (habitId: string) => {
    return todayEntries.find((e) => e.habitId === habitId) || null;
  };

  const isHabitCompleted = (habit: Habit) => {
    return getEntryForHabit(habit.id)?.status === "completed";
  };

  const isHabitCancelled = (habit: Habit) => {
    return getEntryForHabit(habit.id)?.status === "cancelled";
  };

  const activeTaskCount = tasks.filter((t) => !t.completedAt && !t.cancelledAt).length;
  const completedTaskCount = tasks.filter((t) => t.completedAt).length;
  const activeHabitCount = todaysHabits.filter(
    (h) => !isHabitCompleted(h) && !isHabitCancelled(h),
  ).length;
  const completedHabitCount = todaysHabits.filter((h) =>
    isHabitCompleted(h),
  ).length;

  const totalCount = tasks.length + todaysHabits.length;
  const activeCount = activeTaskCount + activeHabitCount;
  const completedCount = completedTaskCount + completedHabitCount;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completedAt && !task.cancelledAt;
    if (filter === "completed") return Boolean(task.completedAt);
    // For "all", exclude cancelled tasks (they'll be shown in cancelled section)
    return !task.cancelledAt;
  });

  const filteredHabits = todaysHabits.filter((habit) => {
    if (filter === "active")
      return !isHabitCompleted(habit) && !isHabitCancelled(habit);
    if (filter === "completed") return isHabitCompleted(habit);
    // For "all", exclude cancelled habits (they'll be shown in cancelled section)
    return !isHabitCancelled(habit);
  });

  const cancelledTasks = tasks.filter((task) => task.cancelledAt);
  const cancelledHabits = todaysHabits.filter((habit) => isHabitCancelled(habit));

  const handleToggleHabit = (habit: Habit, entry: HabitEntry | null) => {
    toggleHabitEntry.mutate({ habit, date: todayDate, currentEntry: entry });
  };

  const handleEditHabit = (habit: Habit) => {
    navigate({ to: "/habits/$id/edit", params: { id: habit.id } });
  };

  const handleEditTask = (task: Task) => {
    navigate({ to: "/tasks/$id/edit", params: { id: task.id } });
  };

  if (isLoading || isHabitsLoading) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8">
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          onClick={() => setFilter("all")}
        >
          All ({totalCount})
        </Button>
        <Button
          variant={filter === "active" ? "default" : "ghost"}
          onClick={() => setFilter("active")}
        >
          Active ({activeCount})
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "ghost"}
          onClick={() => setFilter("completed")}
        >
          Completed ({completedCount})
        </Button>
      </div>

      {filteredHabits.length === 0 && filteredTasks.length === 0 && cancelledHabits.length === 0 && cancelledTasks.length === 0 ? (
        <div className="text-center py-12">All done!</div>
      ) : (
        <>
          {(filteredHabits.length > 0 || filteredTasks.length > 0) && (
            <div className="space-y-3">
              {filteredHabits.map((habit) => (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  entry={getEntryForHabit(habit.id)}
                  onToggle={handleToggleHabit}
                  onEdit={handleEditHabit}
                />
              ))}

              {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask.mutate} onEdit={handleEditTask} />
              ))}
            </div>
          )}

          {(cancelledHabits.length > 0 || cancelledTasks.length > 0) && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium opacity-50">Cancelled</h3>
              {cancelledHabits.map((habit) => (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  entry={getEntryForHabit(habit.id)}
                  onToggle={handleToggleHabit}
                  onEdit={handleEditHabit}
                />
              ))}

              {cancelledTasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask.mutate} onEdit={handleEditTask} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Floating action button */}
      <ButtonLink
        to="/new"
        size="icon"
        className="z-20 fixed bottom-40 right-6 size-14 rounded-full shadow-lg"
      >
        <AddIcon className="size-6" />
      </ButtonLink>

      <Outlet />
    </div>
  );
}
