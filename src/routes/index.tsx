import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useTodaysMood } from "@/hooks/use-moods";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/")({
  component: TasksComponent,
});

function TasksComponent() {
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useTasks();
  const { data: todaysMood, isLoading: isMoodLoading } = useTodaysMood();
  const [filter, setFilter] = useState<"active" | "completed" | "all">("active");
  
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
          No tasks found. Create your first task!
        </div>
      )}

      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div key={task.id} className="p-4 border rounded-lg">
            <h3
              className={`font-semibold ${task.completedAt ? "line-through" : ""}`}
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
      <Outlet />
    </div>
  );
}
