import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useTasks, useToggleTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import {
  useHabits,
  useHabitEntriesByDate,
  useToggleHabitEntry,
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
  archived,
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
}) {
  return (
    <div
      data-completed={completed}
      data-archived={archived}
      className="flex bg-primary/5 data-[completed=true]:bg-success/10 data-[archived=true]:bg-muted/30 items-center gap-4 p-4 rounded-4xl transition-colors"
    >
      <div
        data-archived={archived}
        className={`flex-1 min-w-0 order-1 hover:opacity-80 transition-opacity data-[archived=true]:opacity-60 ${onClick ? "cursor-pointer" : ""}`}
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
  onResume,
  onArchive,
  onUnarchive,
  onDelete,
}: {
  habit: Habit;
  entry: HabitEntry | null;
  onToggle: (habit: Habit, entry: HabitEntry | null) => void;
  onEdit: (habit: Habit) => void;
  onResume?: (habit: Habit) => void;
  onArchive?: (habit: Habit) => void;
  onUnarchive?: (habit: Habit) => void;
  onDelete?: (habit: Habit) => void;
}) {
  const isCompleted = entry?.status === "completed";
  const isPaused = Boolean(habit.pausedAt);
  const isArchived = Boolean(habit.archivedAt);

  return (
    <ListItem
      completed={isCompleted}
      onToggle={() => onToggle(habit, entry)}
      title={habit.title}
      description={!isPaused && !isArchived ? habit.description : undefined}
      disabled={entry?.status === "cancelled" || isPaused || isArchived}
      onClick={isPaused || isArchived ? undefined : () => onEdit(habit)}
      archived={isArchived}
      metadata={
        isArchived ? (
          <p className="text-sm mt-1 flex items-center gap-1">
            <ArchiveIcon className="size-3" />
            Archived
          </p>
        ) : isPaused ? (
          <p className="text-sm mt-1 flex items-center gap-1">
            <PauseIcon className="size-3" />
            Paused
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
  const isPast =
    task.dueDate && !task.completedAt && new Date(task.dueDate) < new Date();

  return (
    <ListItem
      completed={isCompleted}
      onToggle={() => onToggle(task)}
      title={task.title}
      description={!isArchived ? task.description : undefined}
      disabled={isArchived}
      onClick={isArchived ? undefined : () => onEdit(task)}
      archived={isArchived}
      metadata={
        isArchived ? (
          <p className="text-sm mt-1 flex items-center gap-1">
            <ArchiveIcon className="size-3" />
            Archived
          </p>
        ) : task.dueDate ? (
          <p
            data-past={isPast}
            className="text-sm data-[past=true]:text-destructive mt-1 flex items-center gap-1"
          >
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
  const toggleHabitEntry = useToggleHabitEntry();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();

  useEffect(() => {
    if (!isMoodLoading && !isMoodFetching && todaysMood === null) {
      navigate({ to: "/mood/track" });
    }
  }, [todaysMood, isMoodLoading, isMoodFetching, navigate]);

  const todaysHabits = useMemo(() => {
    const today = new Date();
    return habits.filter((habit) => {
      // Always include archived or paused habits regardless of schedule
      if (habit.archivedAt || habit.pausedAt) {
        return true;
      }
      // For active habits, only include if scheduled for today
      return isDateScheduled(today, habit.rrule);
    });
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

  // Combine and sort all items based on their state
  const allItems = useMemo(() => {
    // Filter tasks based on selected filter
    const tasksToShow = tasks.filter((task) => {
      if (filter === "active") {
        return !task.completedAt && !task.archivedAt;
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
    const habitsToShow = todaysHabits.filter((habit) => {
      if (filter === "active") {
        return !isHabitCompleted(habit) && !isHabitCancelled(habit) && !habit.pausedAt && !habit.archivedAt;
      }
      if (filter === "completed") {
        return isHabitCompleted(habit) && !habit.pausedAt && !habit.archivedAt;
      }
      if (filter === "archived") {
        return Boolean(habit.archivedAt);
      }
      return true;
    });

    // Combine and sort: active -> paused -> archived
    const combined: Array<{ type: 'habit' | 'task'; item: Habit | Task }> = [
      ...habitsToShow.map(h => ({ type: 'habit' as const, item: h })),
      ...tasksToShow.map(t => ({ type: 'task' as const, item: t })),
    ];

    return combined.sort((a, b) => {
      const getState = (item: { type: 'habit' | 'task'; item: Habit | Task }) => {
        if (item.type === 'habit') {
          const habit = item.item as Habit;
          if (habit.archivedAt || isHabitCancelled(habit)) return 2; // archived
          if (habit.pausedAt) return 1; // paused
          return 0; // active
        } else {
          const task = item.item as Task;
          if (task.archivedAt) return 2; // archived
          return 0; // active
        }
      };

      const aState = getState(a);
      const bState = getState(b);

      return aState - bState;
    });
  }, [tasks, todaysHabits, filter, isHabitCompleted, isHabitCancelled]);

  const handleToggleHabit = (habit: Habit, entry: HabitEntry | null) => {
    toggleHabitEntry.mutate({ habit, date: todayDate, currentEntry: entry });
  };

  const handleEditHabit = (habit: Habit) => {
    navigate({ to: "/habits/$id/edit", params: { id: habit.id } });
  };

  const handleEditTask = (task: Task) => {
    navigate({ to: "/tasks/$id/edit", params: { id: task.id } });
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

  if (isLoading || isHabitsLoading) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8">
      {allItems.length === 0 ? (
        <div className="text-center py-12">All done!</div>
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
