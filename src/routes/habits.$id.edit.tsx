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
import {
  useHabits,
  useUpdateHabit,
} from "@/hooks/use-habits";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

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
    cancelled: Boolean(habit?.cancelledAt),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!habit || !formData.title.trim()) {
      return;
    }

    try {
      // Update habit details including cancel state
      await updateHabit.mutateAsync({
        ...habit,
        title: formData.title,
        description: formData.description,
        cancelledAt: formData.cancelled ? new Date().toISOString() : null,
      });

      history.back();
    } catch (error) {
      toast.error(`Failed to update habit: ${error}`);
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

          <div className="flex items-center gap-2">
            <Checkbox
              id="cancelled"
              checked={formData.cancelled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, cancelled: checked === true })
              }
            />
            <Label htmlFor="cancelled" className="cursor-pointer">
              Cancel Habit
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
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
