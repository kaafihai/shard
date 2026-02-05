import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useTasks, useToggleTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import {
  useHabits,
  useHabitEntriesByDate,
  useCompleteHabitEntry,
  useUpdateHabit,
  useDeleteHabit,
  getTodayDateString,
} from "@/hooks/use-habits";
import { useTodaysMood } from "@/hooks/use-moods";
import { Button, ButtonLink } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DateIcon,
  CheckIcon,
  HabitIcon,
  PlayIcon,
  PauseIcon,
  ArchiveIcon,
  UnarchiveIcon,
  DeleteIcon,
  AddIcon,
} from "@/lib/icons";
import { format } from "date-fns";
import type { Task, Habit, HabitEntry } from "@/lib/types";

const DAY_LABELS: Record<string, string> = {
  SU: "Sun",
  MO: "Mon",
  TU: "Tue",
  WE: "Wed",
  TH: "Thu",
  FR: "Fri",
  SA: "Sat",
};
const DAY_FULL_NAMES: Record<string, string> = {
  SU: "Sunday",
  MO: "Monday",
  TU: "Tuesday",
  WE: "Wednesday",
  TH: "Thursday",
  FR: "Friday",
  SA: "Saturday",
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
    if (sorted.length === 1) return `Every ${DAY_FULL_NAMES[sorted[0]].toLowerCase()}`;
    return sorted.map((d) => DAY_LABELS[d]).join(", ");
  }

  return rrule;
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
  archived,
  variant = "default",
}: {
  completed: boolean;
  onToggle: () => void;
  title: string;
  disabled?: boolean;
  description?: string;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  archived?: boolean;
  variant?: "default" | "overdue" | "due" | "completed";
}) {
  const getBackgroundColor = () => {
    if (completed || variant === "completed") return "bg-success/10";
    if (variant === "overdue") return "bg-destructive/10";
    if (variant === "due") return "bg-amber-500/10";
    return "bg-primary/5";
  };

  return (
    <div
      data-completed={completed}
      data-archived={archived}
      className={`flex ${getBackgroundColor()} items-center gap-4 p-4 rounded-4xl transition-colors`}
    >
      <div
        data-archived={archived}
        className={`flex-1 min-w-0 order-1 hover:opacity-80 transition-opacity ${onClick ? "cursor-pointer" : ""}`}
        onClick={onClick}
      >
        <h3 className={`font-semibold ${completed ? "opacity-70" : ""}`}>
          {title}
        </h3>
        {description && <p className="text-sm mt-1 line-clamp-2">{description}</p>}
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
  onResume,
  onArchive,
  onUnarchive,
  onDelete,
  getNextOccurrence,
}: {
  habit: Habit;
  entry: HabitEntry | null;
  onToggle: (habit: Habit, entry: HabitEntry | null) => void;
  onEdit: (habit: Habit) => void;
  onResume?: (habit: Habit) => void;
  onArchive?: (habit: Habit) => void;
  onUnarchive?: (habit: Habit) => void;
  onDelete?: (habit: Habit) => void;
  getNextOccurrence?: (rrule: string, afterDate: Date) => Date | null;
}) {
  const isCompleted = entry?.status === "completed";
  const isPaused = Boolean(habit.pausedAt);
  const isArchived = Boolean(habit.archivedAt);
  const hasNoEntry = entry === null && !isPaused && !isArchived;

  const nextOccurrence = hasNoEntry && getNextOccurrence
    ? getNextOccurrence(habit.rrule, new Date())
    : null;

  // Calculate days until next occurrence
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilNext = nextOccurrence ? Math.floor((nextOccurrence.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <ListItem
      completed={isCompleted}
      onToggle={() => onToggle(habit, entry)}
      title={habit.title}
      description={!isPaused && !isArchived && !hasNoEntry ? habit.description : undefined}
      disabled={isPaused || isArchived || hasNoEntry}
      onClick={isPaused || isArchived ? undefined : () => onEdit(habit)}
      archived={isArchived}
      metadata={
        isArchived ? (
          <p className="text-sm font-medium mt-1 flex items-center gap-1">
            <ArchiveIcon className="size-3" />
            <span className="text-gray-600">Archived</span>
          </p>
        ) : isPaused ? (
          <p className="text-sm font-medium mt-1 flex items-center gap-1">
            <PauseIcon className="size-3" />
            <span className="text-gray-600">Paused</span>
          </p>
        ) : hasNoEntry && daysUntilNext === 1 ? (
          <p className="text-sm font-medium mt-1 flex items-center gap-1">
            <HabitIcon className="size-3" />
            <span className="text-gray-600">Next: Tomorrow</span>
          </p>
        ) : hasNoEntry && daysUntilNext === 2 ? (
          <p className="text-sm font-medium mt-1 flex items-center gap-1">
            <HabitIcon className="size-3" />
            <span className="text-gray-600">Next: In 2 days</span>
          </p>
        ) : hasNoEntry && daysUntilNext === 3 ? (
          <p className="text-sm font-medium mt-1 flex items-center gap-1">
            <HabitIcon className="size-3" />
            <span className="text-gray-600">Next: In 3 days</span>
          </p>
        ) : hasNoEntry && nextOccurrence ? (
          <p className="text-sm font-medium mt-1 flex items-center gap-1">
            <HabitIcon className="size-3" />
            <span className="text-gray-600">Next: {format(nextOccurrence, "EEEE, d MMMM yyyy")}</span>
          </p>
        ) : (
          <p className="text-sm mt-1 flex items-center gap-1">
            <HabitIcon className="size-3" />
            {formatRRule(habit.rrule)}
          </p>
        )
      }
      actions={
        isArchived && onUnarchive && onDelete ? (
          <>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(habit)}
            >
              <DeleteIcon />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={() => onUnarchive(habit)}
            >
              <UnarchiveIcon />
            </Button>
          </>
        ) : isPaused && onResume && onArchive ? (
          <>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onArchive(habit)}
            >
              <ArchiveIcon />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={() => onResume(habit)}
            >
              <PlayIcon />
            </Button>
          </>
        ) : undefined
      }
    />
  );
}

function TaskItem({
  task,
  onToggle,
  onEdit,
  onUnarchive,
  onDelete,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit: (task: Task) => void;
  onUnarchive?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}) {
  const isCompleted = Boolean(task.completedAt);
  const isArchived = Boolean(task.archivedAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  if (dueDate) {
    dueDate.setHours(0, 0, 0, 0);
  }

  const isPast = dueDate && !task.completedAt && dueDate < today;
  const isDueToday = dueDate && dueDate.getTime() === today.getTime();

  // Calculate days until due
  const daysUntilDue = dueDate ? Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

  // Determine variant for color coding
  const getVariant = (): "default" | "overdue" | "due" | "completed" => {
    if (isCompleted) return "completed";
    if (isPast) return "overdue";
    if (isDueToday) return "due";
    return "default";
  };

  return (
    <ListItem
      completed={isCompleted}
      onToggle={() => onToggle(task)}
      title={task.title}
      description={!isArchived ? task.description : undefined}
      disabled={isArchived}
      onClick={isArchived ? undefined : () => onEdit(task)}
      archived={isArchived}
      variant={getVariant()}
      metadata={
        isArchived ? (
          <p className="text-sm font-medium mt-1 flex items-center gap-1">
            <ArchiveIcon className="size-3" />
            <span className="text-gray-600">Archived</span>
          </p>
        ) : isCompleted ? undefined : isPast ? (
          <p className="text-sm font-medium text-destructive/70 mt-1 flex items-center gap-1">
            <DateIcon className="size-3" />
            Overdue
          </p>
        ) : isDueToday ? (
          <p className="text-sm font-medium text-amber-600 mt-1 flex items-center gap-1">
            <DateIcon className="size-3" />
            Due today
          </p>
        ) : daysUntilDue === 1 ? (
          <p className="text-sm font-medium mt-1 flex items-center gap-1">
            <DateIcon className="size-3" />
            Due tomorrow
          </p>
        ) : daysUntilDue === 2 ? (
          <p className="text-sm font-medium mt-1 flex items-center gap-1">
            <DateIcon className="size-3" />
            Due in 2 days
          </p>
        ) : daysUntilDue === 3 ? (
          <p className="text-sm font-medium mt-1 flex items-center gap-1">
            <DateIcon className="size-3" />
            Due in 3 days
          </p>
        ) : task.dueDate ? (
          <p className="text-sm font-medium mt-1 flex items-center gap-1">
            <DateIcon className="size-3" />
            {format(new Date(task.dueDate), "PPP")}
          </p>
        ) : undefined
      }
      actions={
        isArchived && onUnarchive && onDelete ? (
          <>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(task)}
            >
              <DeleteIcon />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={() => onUnarchive(task)}
            >
              <UnarchiveIcon />
            </Button>
          </>
        ) : undefined
      }
    />
  );
}

function TasksComponent() {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: habits = [], isLoading: isHabitsLoading } = useHabits(true);
  const todayDate = getTodayDateString();
  const { data: todayEntries = [] } = useHabitEntriesByDate(todayDate);
  const {
    data: todaysMood,
    isLoading: isMoodLoading,
    isFetching: isMoodFetching,
  } = useTodaysMood();
  const [filter, setFilter] = useState<"active" | "completed" | "archived">("active");

  const filterLabels = {
    active: "Today",
    completed: "Completed",
    archived: "Archived",
  };
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);
  const [deleteConfirmHabit, setDeleteConfirmHabit] = useState<Habit | null>(null);
  const toggleTask = useToggleTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const completeHabitEntry = useCompleteHabitEntry();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();

  useEffect(() => {
    if (!isMoodLoading && !isMoodFetching && todaysMood === null) {
      navigate({ to: "/mood/track" });
    }
  }, [todaysMood, isMoodLoading, isMoodFetching, navigate]);

  const getEntryForHabit = (habitId: string) => {
    // Only return entry if it matches today's date
    const entry = todayEntries.find((e) => e.habitId === habitId);
    if (!entry) return null;

    const today = getTodayDateString();
    return entry.date === today ? entry : null;
  };

  const isHabitCompleted = (habit: Habit) => {
    return getEntryForHabit(habit.id)?.status === "completed";
  };

  const isArchivedToday = (archivedAt: string | null) => {
    if (!archivedAt) return false;
    const archivedDate = new Date(archivedAt);
    const today = new Date();
    return archivedDate.toDateString() === today.toDateString();
  };

  const getNextOccurrence = (rrule: string, afterDate: Date): Date | null => {
    const freqMatch = rrule.match(/FREQ=(\w+)/);
    const frequency = freqMatch?.[1] || "DAILY";

    if (frequency === "DAILY") {
      const next = new Date(afterDate);
      next.setDate(next.getDate() + 1);
      return next;
    }

    if (frequency === "WEEKLY") {
      const daysMatch = rrule.match(/BYDAY=([A-Z,]+)/);
      const days = daysMatch ? daysMatch[1].split(",") : [];

      if (days.length === 0) return null;

      const dayMap: Record<string, number> = {
        SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6
      };

      const dayNumbers = days.map(d => dayMap[d]).sort((a, b) => a - b);
      const currentDay = afterDate.getDay();

      let nextDay = dayNumbers.find(d => d > currentDay);
      let daysToAdd = 0;

      if (nextDay !== undefined) {
        daysToAdd = nextDay - currentDay;
      } else {
        daysToAdd = 7 - currentDay + dayNumbers[0];
      }

      const next = new Date(afterDate);
      next.setDate(next.getDate() + daysToAdd);
      return next;
    }

    return null;
  };

  // Combine and sort all items based on their state
  const allItems = useMemo(() => {
    // Filter tasks based on selected filter
    const tasksToShow = tasks.filter((task) => {
      if (filter === "active") {
        return (!task.archivedAt || isArchivedToday(task.archivedAt));
      }
      if (filter === "completed") {
        return Boolean(task.completedAt) && !task.archivedAt;
      }
      if (filter === "archived") {
        return Boolean(task.archivedAt);
      }
      return true;
    });

    // Filter habits based on selected filter
    const habitsToShow = habits.filter((habit) => {
      if (filter === "active") {
        // Include archived/paused habits that happened today, or all active habits
        if (habit.archivedAt) {
          return isArchivedToday(habit.archivedAt);
        }
        // Show all non-archived habits (paused, scheduled for today, or upcoming)
        return true;
      }
      if (filter === "completed") {
        return isHabitCompleted(habit) && !habit.pausedAt && !habit.archivedAt;
      }
      if (filter === "archived") {
        return Boolean(habit.archivedAt);
      }
      return true;
    });

    // Combine and sort
    const combined: Array<{ type: 'habit' | 'task'; item: Habit | Task }> = [
      ...habitsToShow.map(h => ({ type: 'habit' as const, item: h })),
      ...tasksToShow.map(t => ({ type: 'task' as const, item: t })),
    ];

    return combined.sort((a, b) => {
      if (filter !== "active") {
        // Old sorting for non-active filters
        const getState = (item: { type: 'habit' | 'task'; item: Habit | Task }) => {
          if (item.type === 'habit') {
            const habit = item.item as Habit;
            if (habit.archivedAt) return 2;
            if (habit.pausedAt) return 1;
            return 0;
          } else {
            const task = item.item as Task;
            if (task.archivedAt) return 2;
            return 0;
          }
        };
        const aState = getState(a);
        const bState = getState(b);
        return aState - bState;
      }

      // New sorting for "active" filter
      const getState = (item: { type: 'habit' | 'task'; item: Habit | Task }) => {
        if (item.type === 'habit') {
          const habit = item.item as Habit;
          if (habit.archivedAt) return 5; // archived today
          if (habit.pausedAt) return 4; // paused
          const entry = getEntryForHabit(habit.id);
          const isCompleted = entry?.status === 'completed';
          if (isCompleted) return 2; // completed today
          if (entry) return 0; // active with entry for today (skipped or other non-completed status)
          return 3; // upcoming (no entry for today)
        } else {
          const task = item.item as Task;
          if (task.archivedAt) return 5; // archived today
          if (task.completedAt) return 2; // completed today
          return 1; // active tasks
        }
      };

      const aState = getState(a);
      const bState = getState(b);

      if (aState !== bState) {
        return aState - bState;
      }

      // Within tasks (state 1), sort by due date: overdue -> due today -> future
      if (aState === 1 && bState === 1) {
        const taskA = a.item as Task;
        const taskB = b.item as Task;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDateA = taskA.dueDate ? new Date(taskA.dueDate) : null;
        const dueDateB = taskB.dueDate ? new Date(taskB.dueDate) : null;

        if (dueDateA) dueDateA.setHours(0, 0, 0, 0);
        if (dueDateB) dueDateB.setHours(0, 0, 0, 0);

        // Tasks without due dates go to the end
        if (!dueDateA && !dueDateB) return 0;
        if (!dueDateA) return 1;
        if (!dueDateB) return -1;

        return dueDateA.getTime() - dueDateB.getTime();
      }

      return 0;
    });
  }, [tasks, habits, filter, getEntryForHabit, isHabitCompleted, isArchivedToday]);

  const handleToggleHabit = (_habit: Habit, entry: HabitEntry | null) => {
    if (entry && entry.status !== 'completed') {
      completeHabitEntry.mutate({ entry });
    }
  };

  const handleEditHabit = (habit: Habit) => {
    navigate({ to: "/habits/$id/edit", params: { id: habit.id } });
  };

  const handleEditTask = (task: Task) => {
    const readonly = Boolean(task.completedAt);
    navigate({
      to: "/tasks/$id/edit",
      params: { id: task.id },
      search: { readonly }
    });
  };

  const handleResumeHabit = (habit: Habit) => {
    updateHabit.mutate({
      ...habit,
      pausedAt: null,
    });
  };

  const handleArchiveHabit = (habit: Habit) => {
    updateHabit.mutate({
      ...habit,
      archivedAt: new Date().toISOString(),
    });
  };

  const handleUnarchiveHabit = (habit: Habit) => {
    updateHabit.mutate({
      ...habit,
      archivedAt: null,
    });
  };

  const handleUnarchiveTask = (task: Task) => {
    updateTask.mutate({
      ...task,
      archivedAt: null,
    });
  };

  const handleDeleteTask = (task: Task) => {
    setDeleteConfirmTask(task);
  };

  const handleDeleteHabit = (habit: Habit) => {
    setDeleteConfirmHabit(habit);
  };

  const confirmDeleteTask = () => {
    if (deleteConfirmTask) {
      deleteTask.mutate(deleteConfirmTask);
      setDeleteConfirmTask(null);
    }
  };

  const confirmDeleteHabit = () => {
    if (deleteConfirmHabit) {
      deleteHabit.mutate(deleteConfirmHabit);
      setDeleteConfirmHabit(null);
    }
  };

  // Group items by state for headers
  const groupedItems = useMemo(() => {
    if (filter !== "active") return null;

    const groups: Record<number, Array<{ type: 'habit' | 'task'; item: Habit | Task }>> = {};

    allItems.forEach((item) => {
      const getState = () => {
        if (item.type === 'habit') {
          const habit = item.item as Habit;
          if (habit.archivedAt) return 5;
          if (habit.pausedAt) return 4;
          const entry = getEntryForHabit(item.item.id);
          const isCompleted = entry?.status === 'completed';
          if (isCompleted) return 2; // completed today
          if (entry) return 0; // active with entry for today
          return 3; // upcoming (no entry for today)
        } else {
          const task = item.item as Task;
          if (task.archivedAt) return 5;
          if (task.completedAt) return 2;
          return 1;
        }
      };

      const state = getState();
      if (!groups[state]) groups[state] = [];
      groups[state].push(item);
    });

    return groups;
  }, [allItems, filter, getEntryForHabit]);

  if (isLoading || isHabitsLoading) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8">
      <h1 className="text-2xl font-bold">My Tasks</h1>
      {allItems.length === 0 ? (
        <div className="text-center py-12">All done!</div>
      ) : filter === "active" && groupedItems ? (
        <div className="space-y-3">
          {/* Active habits with entries for today (state 0) */}
          {groupedItems[0] && (
            <div className="space-y-3">
              {groupedItems[0].map((item) => (
                <HabitItem
                  key={item.item.id}
                  habit={item.item as Habit}
                  entry={getEntryForHabit(item.item.id)}
                  onToggle={handleToggleHabit}
                  onEdit={handleEditHabit}
                  onResume={handleResumeHabit}
                  onArchive={handleArchiveHabit}
                  onUnarchive={handleUnarchiveHabit}
                  onDelete={handleDeleteHabit}
                  getNextOccurrence={getNextOccurrence}
                />
              ))}
            </div>
          )}

          {/* Active tasks (state 1) */}
          {groupedItems[1] && (
            <div className="space-y-3">
              {groupedItems[1].map((item) => (
                <TaskItem
                  key={item.item.id}
                  task={item.item as Task}
                  onToggle={toggleTask.mutate}
                  onEdit={handleEditTask}
                  onUnarchive={handleUnarchiveTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}

          {/* Completed today (state 2) */}
          {groupedItems[2] && (
            <div className="space-y-3 mt-6">
              <h2 className="text-lg font-semibold">Completed today</h2>
              {groupedItems[2].map((item) =>
                item.type === 'habit' ? (
                  <HabitItem
                    key={item.item.id}
                    habit={item.item as Habit}
                    entry={getEntryForHabit(item.item.id)}
                    onToggle={handleToggleHabit}
                    onEdit={handleEditHabit}
                    onResume={handleResumeHabit}
                    onArchive={handleArchiveHabit}
                    onUnarchive={handleUnarchiveHabit}
                    onDelete={handleDeleteHabit}
                    getNextOccurrence={getNextOccurrence}
                  />
                ) : (
                  <TaskItem
                    key={item.item.id}
                    task={item.item as Task}
                    onToggle={toggleTask.mutate}
                    onEdit={handleEditTask}
                    onUnarchive={handleUnarchiveTask}
                    onDelete={handleDeleteTask}
                  />
                )
              )}
            </div>
          )}

          {/* Upcoming habits (state 3) */}
          {groupedItems[3] && (
            <div className="space-y-3 mt-6">
              <h2 className="text-lg font-semibold">Upcoming habits</h2>
              {groupedItems[3].map((item) => (
                <HabitItem
                  key={item.item.id}
                  habit={item.item as Habit}
                  entry={getEntryForHabit(item.item.id)}
                  onToggle={handleToggleHabit}
                  onEdit={handleEditHabit}
                  onResume={handleResumeHabit}
                  onArchive={handleArchiveHabit}
                  onUnarchive={handleUnarchiveHabit}
                  onDelete={handleDeleteHabit}
                  getNextOccurrence={getNextOccurrence}
                />
              ))}
            </div>
          )}

          {/* Paused habits (state 4) */}
          {groupedItems[4] && (
            <div className="space-y-3 mt-6">
              <h2 className="text-lg font-semibold">Paused</h2>
              {groupedItems[4].map((item) => (
                <HabitItem
                  key={item.item.id}
                  habit={item.item as Habit}
                  entry={getEntryForHabit(item.item.id)}
                  onToggle={handleToggleHabit}
                  onEdit={handleEditHabit}
                  onResume={handleResumeHabit}
                  onArchive={handleArchiveHabit}
                  onUnarchive={handleUnarchiveHabit}
                  onDelete={handleDeleteHabit}
                  getNextOccurrence={getNextOccurrence}
                />
              ))}
            </div>
          )}

          {/* Archived items (state 5) */}
          {groupedItems[5] && (
            <div className="space-y-3 mt-6">
              <h2 className="text-lg font-semibold">Archived today</h2>
              {groupedItems[5].map((item) =>
                item.type === 'habit' ? (
                  <HabitItem
                    key={item.item.id}
                    habit={item.item as Habit}
                    entry={getEntryForHabit(item.item.id)}
                    onToggle={handleToggleHabit}
                    onEdit={handleEditHabit}
                    onResume={handleResumeHabit}
                    onArchive={handleArchiveHabit}
                    onUnarchive={handleUnarchiveHabit}
                    onDelete={handleDeleteHabit}
                    getNextOccurrence={getNextOccurrence}
                  />
                ) : (
                  <TaskItem
                    key={item.item.id}
                    task={item.item as Task}
                    onToggle={toggleTask.mutate}
                    onEdit={handleEditTask}
                    onUnarchive={handleUnarchiveTask}
                    onDelete={handleDeleteTask}
                  />
                )
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {allItems.map((item) =>
            item.type === 'habit' ? (
              <HabitItem
                key={item.item.id}
                habit={item.item as Habit}
                entry={getEntryForHabit(item.item.id)}
                onToggle={handleToggleHabit}
                onEdit={handleEditHabit}
                onResume={handleResumeHabit}
                onArchive={handleArchiveHabit}
                onUnarchive={handleUnarchiveHabit}
                onDelete={handleDeleteHabit}
                getNextOccurrence={getNextOccurrence}
              />
            ) : (
              <TaskItem
                key={item.item.id}
                task={item.item as Task}
                onToggle={toggleTask.mutate}
                onEdit={handleEditTask}
                onUnarchive={handleUnarchiveTask}
                onDelete={handleDeleteTask}
              />
            )
          )}
        </div>
      )}

      {/* Filter and Add Button Container */}
      <div className="fixed bottom-[76px] left-1/2 -translate-x-1/2 z-20 p-1 flex items-center gap-2 rounded-full bg-white shadow-lg">
        <div className="absolute inset-0 bg-primary/10 rounded-full -z-10"></div>
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value as "active" | "completed" | "archived")}
        >
          <SelectTrigger className="h-12 px-4 rounded-full min-w-40">
            <SelectValue>
              {filterLabels[filter]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Today</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <ButtonLink
          to="/new"
          size="icon"
          className="size-12 rounded-full shadow-lg"
        >
          <AddIcon className="size-5" />
        </ButtonLink>
      </div>

      <Outlet />

      {/* Delete Task Confirmation */}
      <AlertDialog open={deleteConfirmTask !== null} onOpenChange={(open) => !open && setDeleteConfirmTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDeleteTask}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Habit Confirmation */}
      <AlertDialog open={deleteConfirmHabit !== null} onOpenChange={(open) => !open && setDeleteConfirmHabit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this habit? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDeleteHabit}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
