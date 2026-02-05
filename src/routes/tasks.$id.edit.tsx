import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { format } from "date-fns";
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
import { DatePicker } from "@/components/ui/date-picker";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ArchiveIcon, UndoIcon, DateIcon } from "@/lib/icons";

export const Route = createFileRoute("/tasks/$id/edit")({
  component: EditTaskComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      readonly: search?.readonly === 'true' || search?.readonly === true,
    };
  },
});

function EditTaskComponent() {
  const { history } = useRouter();
  const { id } = Route.useParams();
  const { readonly } = Route.useSearch();
  const { data: tasks = [], isLoading } = useTasks();
  const updateTask = useUpdateTask();

  const task = tasks.find((t) => t.id === id);

  const [formData, setFormData] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    dueDate: task?.dueDate ?? null,
  });

  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description ?? "",
        dueDate: task.dueDate ?? null,
      });
    }
  }, [task]);

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
      });
      history.back();
    } catch (error) {
      toast.error(`Failed to update task: ${error}`);
    }
  };

  const handleArchive = async () => {
    if (!task) return;

    setIsArchiving(true);
    try {
      await updateTask.mutateAsync({
        ...task,
        archivedAt: new Date().toISOString(),
      });
      setShowArchiveConfirm(false);
      history.back();
    } catch (error) {
      toast.error(`Failed to archive task: ${error}`);
      setIsArchiving(false);
    }
  };

  const handleMarkIncomplete = async () => {
    if (!task) return;

    try {
      await updateTask.mutateAsync({
        ...task,
        completedAt: null,
      });
      history.back();
    } catch (error) {
      toast.error(`Failed to mark task as incomplete: ${error}`);
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
            <Button className="w-full" onClick={() => history.back()}>Go Back</Button>
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
      <DialogContent className={showArchiveConfirm ? "min-h-0" : undefined}>
        <DialogHeader>
          <DialogTitle>
            {showArchiveConfirm ? 'Archive Task' : readonly ? 'Task Details' : 'Edit Task'}
          </DialogTitle>
        </DialogHeader>
        {showArchiveConfirm ? (
          <>
            <p className="text-sm">
              Are you sure you want to archive this task? You can always unarchive it later.
            </p>
            <DialogFooter className="flex-row gap-2 flex-none -mb-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowArchiveConfirm(false)}
                disabled={isArchiving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleArchive}
                disabled={isArchiving}
                className="flex-1"
              >
                Archive
              </Button>
            </DialogFooter>
          </>
        ) : (
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
              readOnly={readonly}
              disabled={readonly}
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
              readOnly={readonly}
              disabled={readonly}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dueDate">Due Date</Label>
            {readonly ? (
              <div className="flex items-center gap-2 h-12 px-3 bg-input/10 border rounded-4xl text-sm opacity-50">
                <DateIcon className="size-4" />
                {formData.dueDate ? format(new Date(formData.dueDate), "PPP") : "No due date"}
              </div>
            ) : (
              <DatePicker
                value={formData.dueDate}
                onChange={(date) => setFormData({ ...formData, dueDate: date })}
              />
            )}
          </div>

          {!readonly && (
            <DialogFooter className="flex-row gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowArchiveConfirm(true)}
                disabled={updateTask.isPending}
              >
                <ArchiveIcon />
                Archive
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!formData.title.trim() || updateTask.isPending}
              >
                Save Changes
              </Button>
            </DialogFooter>
          )}
          {readonly && (
            <DialogFooter className="flex-row gap-2">
              {task.completedAt && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleMarkIncomplete}
                  disabled={updateTask.isPending}
                >
                  <UndoIcon />
                  Mark as incomplete
                </Button>
              )}
              <Button
                type="button"
                onClick={() => history.back()}
                className="flex-1"
              >
                Close
              </Button>
            </DialogFooter>
          )}
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
