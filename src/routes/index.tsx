import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import type { TaskFilter } from "@/lib/types";

export const Route = createFileRoute("/")({
  component: TasksComponent,
});

function TasksComponent() {
  const { data: tasks = [], isLoading } = useTasks();
  const [filter, setFilter] = useState<TaskFilter>("all");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  if (isLoading) {
    return <div className="text-center">Loading tasks...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          Active ({tasks.filter((t) => !t.completed).length})
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "ghost"}
          onClick={() => setFilter("completed")}
        >
          Completed ({tasks.filter((t) => t.completed).length})
        </Button>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          No tasks found. Create your first task!
        </div>
      )}

      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div key={task.id} className="p-4 border rounded-lg">
            <h3
              className={`font-semibold ${task.completed ? "line-through" : ""}`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {task.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
