import { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import type { HabitInput } from "@/lib/types";
import { useCreateHabit } from "@/hooks/use-habits";
import { useNavigate } from "@tanstack/react-router";
import { DialogFooter } from "./ui/dialog";
import { toast } from "sonner";
import { RRulePicker } from "./rrule-picker";

interface HabitFormProps {
  onSuccess?: () => void;
}

export function HabitForm({ onSuccess }: HabitFormProps) {
  const navigate = useNavigate();
  const createHabit = useCreateHabit();

  const [formData, setFormData] = useState<HabitInput>({
    title: "",
    description: "",
    rrule: "FREQ=DAILY",
    archivedAt: null,
    pausedAt: null,
    cancelledAt: null,
  });

  const handleRRuleChange = (rrule: string | null) => {
    setFormData({ ...formData, rrule: rrule ?? "FREQ=DAILY" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    try {
      await createHabit.mutateAsync(formData);
      onSuccess?.();
      navigate({ to: "/" });
    } catch (error) {
      toast.error(`Failed to create habit: ${error}`);
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
          rows={3}
        />
      </div>

      <RRulePicker
        value={formData.rrule}
        onChange={handleRRuleChange}
      />

      <DialogFooter>
        <Button
          type="submit"
          disabled={!formData.title.trim() || createHabit.isPending}
        >
          Create Habit
        </Button>
      </DialogFooter>
    </form>
  );
}
