import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { RRulePicker } from "@/components/rrule-picker";
import { useCreateTask } from "@/hooks/use-tasks";
import { useCreateHabit } from "@/hooks/use-habits";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/new")({
  component: NewItemComponent,
});

function NewItemComponent() {
  const { history } = useRouter();
  const navigate = useNavigate();

  const createTask = useCreateTask();
  const createHabit = useCreateHabit();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [rrule, setRrule] = useState<string | null>(null);

  const isHabit = rrule !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    try {
      if (isHabit) {
        await createHabit.mutateAsync({
          title,
          description,
          rrule: rrule,
          archivedAt: null,
        });
      } else {
        await createTask.mutateAsync({
          title,
          description,
          dueDate,
          completedAt: null,
          cancelledAt: null,
        });
      }
      navigate({ to: "/" });
    } catch (error) {
      toast.error(`Failed to create ${isHabit ? "habit" : "task"}: ${error}`);
    }
  };

  const isPending = createTask.isPending || createHabit.isPending;

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
          <DialogTitle>Create New {isHabit ? "Habit" : "Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details"
              rows={3}
            />
          </div>

          <RRulePicker
            value={rrule}
            onChange={(value) => setRrule(value)}
          />

          {!isHabit && (
            <div className="flex flex-col gap-2">
              <Label>Due Date</Label>
              <DatePicker
                value={dueDate}
                onChange={(date) => setDueDate(date)}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={!title.trim() || isPending}
            >
              Create {isHabit ? "Habit" : "Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
