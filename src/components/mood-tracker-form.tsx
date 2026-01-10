import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import type { MoodInput } from "@/lib/types";
import { useCreateMood } from "@/hooks/use-moods";
import { useNavigate } from "@tanstack/react-router";
import {
  SmileyIcon,
  SmileySadIcon,
  SmileyMehIcon,
  SmileyXEyesIcon,
  Icon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SmileyWinkIcon } from "@phosphor-icons/react/dist/ssr";

interface MoodTrackerFormProps {
  onSuccess?: () => void;
}

const moodOptions: Array<{
  value: MoodInput["mood"];
  label: string;
  icon: Icon;
}> = [
  {
    value: "terrible",
    label: "Terrible",
    icon: SmileyXEyesIcon,
  },
  {
    value: "bad",
    label: "Bad",
    icon: SmileySadIcon,
  },
  {
    value: "okay",
    label: "Okay",
    icon: SmileyMehIcon,
  },
  {
    value: "great",
    label: "Great",
    icon: SmileyWinkIcon,
  },
  {
    value: "good",
    label: "Good",
    icon: SmileyIcon,
  },
];

export function MoodTrackerForm({ onSuccess }: MoodTrackerFormProps) {
  const navigate = useNavigate();
  const createMood = useCreateMood();

  const [formData, setFormData] = useState<MoodInput>({
    mood: "okay",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMood.mutateAsync(formData);
      onSuccess?.();
      navigate({ to: "/" });
    } catch (error) {
      console.error("Failed to track mood:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label>How are you feeling today?</Label>
        <div className="grid grid-cols-5 gap-2">
          {moodOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = formData.mood === option.value;
            return (
              <Button
                size="none"
                key={option.value}
                type="button"
                variant="ghost"
                onClick={() => setFormData({ ...formData, mood: option.value })}
                className={cn(
                  "flex-col p-3 rounded-2xl border-2",
                  isSelected
                    ? "bg-primary/10"
                    : "border-border hover:border-primary/50",
                )}
              >
                <Icon
                  className={cn("size-8")}
                  weight={isSelected ? "fill" : "regular"}
                />
                <span className="text-xs font-medium">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Add a note (optional)</Label>
        <Textarea
          id="note"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          placeholder="How was your day? Any thoughts to share?"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate({ to: "/" })}
          className="flex-1"
        >
          Skip
        </Button>
        <Button
          type="submit"
          disabled={createMood.isPending}
          className="flex-1"
        >
          {createMood.isPending ? "Saving..." : "Save Mood"}
        </Button>
      </div>
    </form>
  );
}
