import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RabbitMascot } from "@/components/rabbit-mascot";
import { cn } from "@/lib/utils";
import { BatteryEmpty, BatteryLow, BatteryMedium, BatteryFull, BatteryCharging } from "@phosphor-icons/react";

export type EnergyLevel = "depleted" | "low" | "moderate" | "high" | "supercharged";

const ENERGY_OPTIONS: Array<{
  value: EnergyLevel;
  label: string;
  description: string;
  icon: typeof BatteryEmpty;
  color: string;
}> = [
  { value: "depleted", label: "Depleted", description: "Running on empty", icon: BatteryEmpty, color: "text-red-400" },
  { value: "low", label: "Low", description: "Taking it easy", icon: BatteryLow, color: "text-orange-400" },
  { value: "moderate", label: "Moderate", description: "Steady pace", icon: BatteryMedium, color: "text-amber-400" },
  { value: "high", label: "High", description: "Feeling good!", icon: BatteryFull, color: "text-green-400" },
  { value: "supercharged", label: "Supercharged", description: "Let's go!", icon: BatteryCharging, color: "text-primary" },
];

const RABBIT_RESPONSES: Record<EnergyLevel, { message: string; mood: "happy" | "encouraging" | "nudging" | "celebrating" }> = {
  depleted: { message: "Low battery day? That's okay. Let's keep it super gentle today.", mood: "encouraging" },
  low: { message: "A softer day. Small wins count just as much, you know.", mood: "encouraging" },
  moderate: { message: "Steady energy! A good day to chip away at things.", mood: "happy" },
  high: { message: "Nice energy today! Want to tackle something you've been putting off?", mood: "happy" },
  supercharged: { message: "Wow, look at you! Let's make the most of this energy!", mood: "celebrating" },
};

interface EnergyCheckInProps {
  open: boolean;
  onComplete: (energy: EnergyLevel) => void;
  onSkip: () => void;
}

export function EnergyCheckIn({ open, onComplete, onSkip }: EnergyCheckInProps) {
  const [selected, setSelected] = useState<EnergyLevel | null>(null);

  const handleSubmit = () => {
    if (selected) {
      onComplete(selected);
      setSelected(null);
    }
  };

  const response = selected ? RABBIT_RESPONSES[selected] : null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onSkip(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Energy Check-in</DialogTitle>
          <DialogDescription>How's your battery today?</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {ENERGY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selected === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelected(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-transparent hover:bg-primary/5"
                  )}
                >
                  <Icon
                    className={cn("size-7", isSelected ? "text-primary-foreground" : option.color)}
                    weight={isSelected ? "fill" : "regular"}
                  />
                  <span className="text-[10px] font-medium leading-tight text-center">{option.label}</span>
                </button>
              );
            })}
          </div>

          {response && (
            <RabbitMascot
              mood={response.mood}
              message={response.message}
              size="sm"
            />
          )}
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={!selected} className="flex-1">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper to get energy-based task suggestions
export function getEnergyAdvice(energy: EnergyLevel): string {
  switch (energy) {
    case "depleted": return "Focus on one tiny thing today. That's enough.";
    case "low": return "Pick the easiest tasks first. Momentum will come.";
    case "moderate": return "A good day for your regular tasks and habits.";
    case "high": return "Great day to tackle bigger tasks or start something new!";
    case "supercharged": return "You could knock out those tasks you've been avoiding!";
  }
}
