import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useTasks, useToggleTask, useDeleteTask } from "@/hooks/use-tasks";
import { useTodaysMood } from "@/hooks/use-moods";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckIcon, TrashIcon } from "@phosphor-icons/react";
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
  return (
    <div className="flex bg-primary/10 items-center gap-4 p-4 rounded-4xl group">
  
      <Button
        variant="ghost"
        size="icon"
        className=""
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
      </div>
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
  const [filter, setFilter] = useState<"active" | "completed" | "all">("active");
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();
  
  useEffect(() => {
    if (todaysMood === null) {
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
        <Button
          variant={filter === "all" ? "default" : "ghost"}
          onClick={() => setFilter("all")}
        >
          All ({tasks.length})
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
