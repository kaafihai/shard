import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks/$id/edit")({
  component: EditTaskComponent,
});

function EditTaskComponent() {
  const { history } = useRouter();
  const { id } = Route.useParams();
  const { data: tasks = [], isLoading } = useTasks();
  const updateTask = useUpdateTask();

  const task = tasks.find((t) => t.id === id);

  const [formData, setFormData] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    dueDate: task?.dueDate ?? null,
    cancelled: Boolean(task?.cancelledAt),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!task || !formData.title.trim()) {
      return;
    }

    try {
      await updateTask.mutateAsync({
        ...task,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        cancelledAt: formData.cancelled ? new Date().toISOString() : null,
      });
      history.back();
    } catch (error) {
      toast.error(`Failed to update task: ${error}`);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={() => history.back()}>
        <DialogContent>
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!task) {
    return (
      <Dialog open={true} onOpenChange={() => history.back()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task not found</DialogTitle>
          </DialogHeader>
          <p className="">The task you're looking for doesn't exist.</p>
          <DialogFooter>
            <Button onClick={() => history.back()}>Go Back</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          history.back();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
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

          <div className="flex items-center gap-2">
            <Checkbox
              id="cancelled"
              checked={formData.cancelled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, cancelled: checked === true })
              }
            />
            <Label htmlFor="cancelled" className="cursor-pointer">
              Cancel Task
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={!formData.title.trim() || updateTask.isPending}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
