import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useTasks, useToggleTask, useDeleteTask } from "@/hooks/use-tasks";
import { useHabits, useHabitEntriesByDate, useToggleHabitEntry, getTodayDateString } from "@/hooks/use-habits";
import { useTodaysMood } from "@/hooks/use-moods";
import { Button, ButtonLink } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CalendarBlankIcon, CheckIcon, PencilSimpleIcon, TrashIcon, RepeatIcon, PlusIcon } from "@phosphor-icons/react";
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
}: {
  completed: boolean;
  onToggle: () => void;
  title: string;
  description?: string;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      data-completed={completed}
      className="flex bg-primary/5 data-[completed=true]:bg-success/10 items-center gap-4 p-4 rounded-4xl transition-colors"
    >
      <div className="flex-1 min-w-0 order-1 md:order-2">
        <h3
          className={`font-semibold ${completed ? "text-muted-foreground" : ""}`}
        >
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {metadata}
      </div>
      {actions && <div className="flex items-center gap-1 order-2 md:order-3">{actions}</div>}
      <Button
        size="icon"
        variant={completed ? "ghost" : 'success'}
        disabled={completed}
        onClick={onToggle}
        className="order-3 md:order-1"
      >
        <CheckIcon />
      </Button>
    </div>
  );
}

function HabitItem({
  habit,
  entry,
  onToggle,
}: {
  habit: Habit;
  entry: HabitEntry | null;
  onToggle: (habit: Habit, entry: HabitEntry | null) => void;
}) {
  const isCompleted = entry?.status === "completed";

  return (
    <ListItem
      completed={isCompleted}
      onToggle={() => onToggle(habit, entry)}
      title={habit.title}
      description={habit.description}
      metadata={
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
          <RepeatIcon className="size-3" />
          {habit.rrule}
        </p>
      }
    />
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const isCompleted = Boolean(task.completedAt);
  const isPast =
    task.dueDate && !task.completedAt && new Date(task.dueDate) < new Date();

  return (
    <ListItem
      completed={isCompleted}
      onToggle={() => onToggle(task)}
      title={task.title}
      description={task.description}
      metadata={
        task.dueDate ? (
          <p
            data-past={isPast}
            className="text-sm data-[past=true]:text-destructive text-muted-foreground mt-1 flex items-center gap-1"
          >
            <CalendarBlankIcon className="size-3" />
            {format(new Date(task.dueDate), "PPP")}
          </p>
        ) : undefined
      }
      actions={
        <>
          <ButtonLink
            variant="ghost"
            size="icon"
            to="/tasks/$id/edit"
            params={{ id: task.id }}
            disabled={isCompleted}
          >
            <PencilSimpleIcon />
          </ButtonLink>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(task)}
          >
            <TrashIcon />
          </Button>
        </>
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
  const { data: todaysMood, isLoading: isMoodLoading } = useTodaysMood();
  const [filter, setFilter] = useState<"active" | "completed" | "all">("all");
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();
  const toggleHabitEntry = useToggleHabitEntry();

  useEffect(() => {
    if (!isMoodLoading && todaysMood === null) {
      navigate({ to: "/mood/track" });
    }
  }, [todaysMood, isMoodLoading, navigate]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completedAt;
    if (filter === "completed") return Boolean(task.completedAt);
    return true;
  });

  const todaysHabits = useMemo(() => {
    const today = new Date();
    return habits.filter((habit) => isDateScheduled(today, habit.rrule));
  }, [habits]);

  const getEntryForHabit = (habitId: string) => {
    return todayEntries.find((e) => e.habitId === habitId) || null;
  };

  const handleToggleHabit = (habit: Habit, entry: HabitEntry | null) => {
    toggleHabitEntry.mutate({ habit, date: todayDate, currentEntry: entry });
  };

  const completedHabitsCount = todaysHabits.filter((h) => getEntryForHabit(h.id)?.status === 'completed').length;

  if (isLoading || isHabitsLoading) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8">
      {/* Today's Habits Section */}
      <div className="flex justify-between items-end border-b pb-4">
        <h2 className="text-3xl font-bold">Today's Habits</h2>
        {todaysHabits.length > 0 && (
          <span className="text-muted-foreground text-sm">
            {completedHabitsCount}/{todaysHabits.length}
          </span>
        )}
      </div>

      {todaysHabits.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No habits scheduled for today.
        </div>
      ) : (
        <div className="space-y-3">
          {todaysHabits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              entry={getEntryForHabit(habit.id)}
              onToggle={handleToggleHabit}
            />
          ))}
        </div>
      )}

      {/* Tasks Section */}
      <div className="flex justify-between items-end border-b pb-4">
        <h2 className="text-3xl font-bold">Tasks</h2>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          onClick={() => setFilter("all")}
        >
          All ({tasks.length})
        </Button>
        <Button
          variant={filter === "active" ? "default" : "ghost"}
          onClick={() => setFilter("active")}
        >
          Active ({tasks.filter((t) => !t.completedAt).length})
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "ghost"}
          onClick={() => setFilter("completed")}
        >
          Completed ({tasks.filter((t) => Boolean(t.completedAt)).length})
        </Button>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          All done!
        </div>
      )}

      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={toggleTask.mutate}
            onDelete={deleteTask.mutate}
          />
        ))}
      </div>

      {/* Floating action button */}
      <ButtonLink
        to="/new"
        size="icon"
        className="fixed bottom-28 right-6 size-14 rounded-full shadow-lg"
      >
        <PlusIcon className="size-6" />
      </ButtonLink>

      <Outlet />
    </div>
  );
}
