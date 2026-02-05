import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import {
  useHabits,
  useUpdateHabit,
  useDeleteHabit,
} from "@/hooks/use-habits";
import { Button } from "@/components/ui/button";
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
  CheckIcon,
  ArchiveIcon,
  UnarchiveIcon,
  DeleteIcon,
} from "@/lib/icons";
import type { Task, Habit } from "@/lib/types";

export const Route = createFileRoute("/archive")({
  component: ArchiveComponent,
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
  onUnarchive,
  onDelete,
}: {
  habit: Habit;
  onUnarchive?: (habit: Habit) => void;
  onDelete?: (habit: Habit) => void;
}) {
  return (
    <ListItem
      completed={false}
      onToggle={() => {}}
      title={habit.title}
      description={undefined}
      disabled={true}
      onClick={undefined}
      archived={true}
      metadata={
        <p className="text-sm mt-1 flex items-center gap-1">
          <ArchiveIcon className="size-3" />
          Archived
        </p>
      }
      actions={
        onUnarchive && onDelete ? (
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
        ) : undefined
      }
    />
  );
}

function TaskItem({
  task,
  onUnarchive,
  onDelete,
}: {
  task: Task;
  onUnarchive?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}) {
  return (
    <ListItem
      completed={false}
      onToggle={() => {}}
      title={task.title}
      description={undefined}
      disabled={true}
      onClick={undefined}
      archived={true}
      metadata={
        <p className="text-sm mt-1 flex items-center gap-1">
          <ArchiveIcon className="size-3" />
          Archived
        </p>
      }
      actions={
        onUnarchive && onDelete ? (
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

function ArchiveComponent() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: habits = [], isLoading: isHabitsLoading } = useHabits(true);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);
  const [deleteConfirmHabit, setDeleteConfirmHabit] = useState<Habit | null>(null);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();

  // Filter only archived items
  const archivedItems = useMemo(() => {
    const archivedTasks = tasks.filter((task) => task.archivedAt);
    const archivedHabits = habits.filter((habit) => habit.archivedAt);

    const combined: Array<{ type: 'habit' | 'task'; item: Habit | Task }> = [
      ...archivedHabits.map(h => ({ type: 'habit' as const, item: h })),
      ...archivedTasks.map(t => ({ type: 'task' as const, item: t })),
    ];

    return combined;
  }, [tasks, habits]);

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
      <h1 className="text-2xl font-bold">Archive</h1>

      {archivedItems.length === 0 ? (
        <div className="text-center py-12">No archived items</div>
      ) : (
        <div className="space-y-3">
          {archivedItems.map((item) =>
            item.type === 'habit' ? (
              <HabitItem
                key={item.item.id}
                habit={item.item as Habit}
                onUnarchive={handleUnarchiveHabit}
                onDelete={handleDeleteHabit}
              />
            ) : (
              <TaskItem
                key={item.item.id}
                task={item.item as Task}
                onUnarchive={handleUnarchiveTask}
                onDelete={handleDeleteTask}
              />
            )
          )}
        </div>
      )}

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
