import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
import { RRulePicker } from "@/components/rrule-picker";
import {
  useHabits,
  useUpdateHabit,
} from "@/hooks/use-habits";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { PauseIcon, ArchiveIcon } from "@/lib/icons";

export const Route = createFileRoute("/habits/$id/edit")({
  component: EditHabitComponent,
});

function EditHabitComponent() {
  const { history } = useRouter();
  const { id } = Route.useParams();
  const { data: habits = [], isLoading } = useHabits();
  const updateHabit = useUpdateHabit();

  const habit = habits.find((h) => h.id === id);

  const [formData, setFormData] = useState({
    title: habit?.title ?? "",
    description: habit?.description ?? "",
    rrule: habit?.rrule ?? "FREQ=DAILY",
  });

  useEffect(() => {
    if (habit) {
      setFormData({
        title: habit.title,
        description: habit.description ?? "",
        rrule: habit.rrule,
      });
    }
  }, [habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!habit || !formData.title.trim()) {
      return;
    }

    try {
      // Update habit details
      await updateHabit.mutateAsync({
        ...habit,
        title: formData.title,
        description: formData.description,
        rrule: formData.rrule,
      });

      history.back();
    } catch (error) {
      toast.error(`Failed to update habit: ${error}`);
    }
  };

  const handlePause = async () => {
    if (!habit) return;

    try {
      await updateHabit.mutateAsync({
        ...habit,
        pausedAt: habit.pausedAt ? null : new Date().toISOString(),
      });
      history.back();
    } catch (error) {
      toast.error(`Failed to pause habit: ${error}`);
    }
  };

  const handleArchive = async () => {
    if (!habit) return;

    try {
      await updateHabit.mutateAsync({
        ...habit,
        archivedAt: new Date().toISOString(),
      });
      history.back();
    } catch (error) {
      toast.error(`Failed to archive habit: ${error}`);
    }
  };

  const isPaused = Boolean(habit?.pausedAt);

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

          <RRulePicker
            value={formData.rrule}
            onChange={(rrule) => setFormData({ ...formData, rrule: rrule ?? "FREQ=DAILY" })}
            allowNone={false}
          />

          <DialogFooter className="flex-row gap-2">
            {isPaused ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleArchive}
                disabled={updateHabit.isPending}
              >
                <ArchiveIcon />
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={handlePause}
                disabled={updateHabit.isPending}
              >
                <PauseIcon />
                Pause
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
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
