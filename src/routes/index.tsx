import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useTasks, useToggleTask, useDeleteTask } from "@/hooks/use-tasks";
import { useTodaysMood } from "@/hooks/use-moods";
import { Button, ButtonLink } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CalendarBlankIcon, CheckIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import type { Task } from "@/lib/types";

export const Route = createFileRoute("/")({
  component: TasksComponent,
});

function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {

  const past = task.dueDate && !task.completedAt && (new Date(task.dueDate) < new Date());
  return (
    <div data-completed={Boolean(task.completedAt)} className="flex bg-primary/10 data-[completed=true]:bg-foreground/10 items-center gap-4 p-4 rounded-4xl group">
      <Button
        size="icon"
        variant={Boolean(task.completedAt) ? 'ghost' : 'default'}
        disabled={Boolean(task.completedAt)}
        onClick={() => onToggle(task)}
      >
        <CheckIcon />
      </Button>
      <div className="flex-1 min-w-0">
        <h3
          className={`font-semibold ${task.completedAt ? "opacity-80 text-muted-foreground" : ""}`}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {task.description}
          </p>
        )}
        {task.dueDate && (
          <p data-past={past} className="text-sm data-[past=true]:text-destructive text-muted-foreground mt-1 flex items-center gap-1">
            <CalendarBlankIcon className="size-3" />
            {format(new Date(task.dueDate), "PPP")}
          </p>
        )}
      </div>
      <ButtonLink
        variant="ghost"
        size="icon"
        to='/tasks/$id/edit'
        params={{id: task.id}}
        disabled={Boolean(task.completedAt)}
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
    </div>
  );
}

function TasksComponent() {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: todaysMood, isLoading: isMoodLoading } = useTodaysMood();
  const [filter, setFilter] = useState<"active" | "completed" | "all">("all");
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

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

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">My Tasks</h2>
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
      <Outlet />
    </div>
  );
}
