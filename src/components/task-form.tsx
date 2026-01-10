import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
    completed: false,
    priority: "Medium",
    tags: [],
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
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              priority: value as "Low" | "Medium" | "High",
            })
          }
        >
          <SelectTrigger id="priority" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
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
