import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import type { TaskInput } from "@/lib/types";
import { useCreateTask } from "@/hooks/use-tasks";
import { useNavigate } from "@tanstack/react-router";

interface TaskFormProps {
  onSuccess?: () => void;
}

export function TaskForm({ onSuccess }: TaskFormProps) {
  const navigate = useNavigate();
  const createTask = useCreateTask();

  const [formData, setFormData] = useState<TaskInput>({
    title: "",
    description: "",
    dueDate: null,
    completedAt: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    try {
      await createTask.mutateAsync(formData);
      onSuccess?.();
      navigate({ to: "/" });
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter task title"
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Add details about this task"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              dueDate: e.target.value || null,
            })
          }
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate({ to: "/" })}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!formData.title.trim() || createTask.isPending}
          className="flex-1"
        >
          {createTask.isPending ? "Creating..." : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
