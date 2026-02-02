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
import {
  useHabits,
  useUpdateHabit,
  useArchiveHabit,
  useHabitEntriesByDate,
  useCreateHabitEntry,
  getTodayDateString,
} from "@/hooks/use-habits";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { PauseIcon, XCircleIcon } from "@phosphor-icons/react";

export const Route = createFileRoute("/habits/$id/edit")({
  component: EditHabitComponent,
});

function EditHabitComponent() {
  const { history } = useRouter();
  const { id } = Route.useParams();
  const { data: habits = [], isLoading } = useHabits();
  const updateHabit = useUpdateHabit();

  const archiveHabit = useArchiveHabit();
  const createHabitEntry = useCreateHabitEntry();
  const todayDate = getTodayDateString();
  const { data: todayEntries = [] } = useHabitEntriesByDate(todayDate);

  const habit = habits.find((h) => h.id === id);
  const todayEntry = todayEntries.find((e) => e.habitId === id) || null;

  const [formData, setFormData] = useState({
    title: habit?.title ?? "",
    description: habit?.description ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!habit || !formData.title.trim()) {
      return;
    }

    try {
      await updateHabit.mutateAsync({
        ...habit,
        title: formData.title,
        description: formData.description,
      });
      history.back();
    } catch (error) {
      toast.error(`Failed to update habit: ${error}`);
    }
  };

  const handlePause = async () => {
    if (!habit) return;
    try {
      archiveHabit.mutate(habit);
      history.back();
    } catch (error) {
      toast.error(`Failed to pause habit: ${error}`);
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

  if (!habit) {
    return (
      <Dialog open={true} onOpenChange={() => history.back()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Habit not found</DialogTitle>
          </DialogHeader>
          <p>The habit you're looking for doesn't exist.</p>
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
          <DialogTitle>Edit Habit</DialogTitle>
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
              placeholder="Enter habit title"
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
              placeholder="Add details about this habit"
              rows={4}
            />
          </div>

          <DialogFooter className="flex justify-between flex-row">
            <Button type="button" variant="destructive" onClick={handlePause}>
              <PauseIcon />
              Pause
            </Button>
            <Button
              type="submit"
              disabled={!formData.title.trim() || updateHabit.isPending}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
