import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import type { TaskInput } from "@/lib/types";
import { useCreateTask } from "@/hooks/use-tasks";
import { useNavigate } from "@tanstack/react-router";
import { DialogFooter } from "./ui/dialog";
import { DatePicker } from "./ui/date-picker";
import { toast } from "sonner";

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
    cancelledAt: null,
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
      toast.error(`Failed to create task: ${error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
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

      <div className="flex flex-col gap-2">
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <DatePicker
          value={formData.dueDate}
          onChange={(date) => setFormData({ ...formData, dueDate: date })}
        />
      </div>


      <DialogFooter>
        <Button
          type="submit"
          disabled={!formData.title.trim() || createTask.isPending}
        >
          Create Task
        </Button>
      </DialogFooter>
    </form>
  );
}
