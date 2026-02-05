import { useState, useEffect } from "react";
import { Label } from "./ui/label";
import { Toggle } from "./ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "./ui/select";

type Frequency = "DAILY" | "WEEKLY";

const FREQUENCY_LABELS: Record<string, string> = {
  NONE: "Don't repeat",
  DAILY: "Daily",
  WEEKLY: "Weekly",
};

const DAYS_OF_WEEK = [
  { value: "SU", label: "S" },
  { value: "MO", label: "M" },
  { value: "TU", label: "T" },
  { value: "WE", label: "W" },
  { value: "TH", label: "T" },
  { value: "FR", label: "F" },
  { value: "SA", label: "S" },
] as const;

interface RRulePickerProps {
  value: string | null;
  onChange: (rrule: string | null) => void;
  allowNone?: boolean;
}

function parseRRule(rrule: string | null): { frequency: Frequency | null; days: string[] } {
  if (!rrule) return { frequency: null, days: [] };

  const freqMatch = rrule.match(/FREQ=(\w+)/);
  const frequency = (freqMatch?.[1] as Frequency) || "DAILY";

  const daysMatch = rrule.match(/BYDAY=([A-Z,]+)/);
  const days = daysMatch ? daysMatch[1].split(",") : [];

  return { frequency, days };
}

function buildRRule(frequency: Frequency | null, days: string[]): string | null {
  if (!frequency) return null;
  if (frequency === "WEEKLY" && days.length > 0) {
    return `FREQ=WEEKLY;BYDAY=${days.join(",")}`;
  }
  return `FREQ=${frequency}`;
}

export function RRulePicker({ value, onChange, allowNone = true }: RRulePickerProps) {
  const parsed = parseRRule(value);
  const [frequency, setFrequency] = useState<Frequency | null>(parsed.frequency);
  const [selectedDays, setSelectedDays] = useState<string[]>(parsed.days);

  useEffect(() => {
    const newRRule = buildRRule(frequency, frequency === "WEEKLY" ? selectedDays : []);
    if (newRRule !== value) {
      onChange(newRRule);
    }
  }, [frequency, selectedDays, onChange, value]);

  const handleFrequencyChange = (newFreq: string | null) => {
    if (!newFreq || newFreq === "NONE") {
      setFrequency(null);
      return;
    }
    const freq = newFreq as Frequency;
    setFrequency(freq);

    // Set default days when switching to weekly
    if (freq === "WEEKLY" && selectedDays.length === 0) {
      setSelectedDays(["MO", "TU", "WE", "TH", "FR"]);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        // Don't allow deselecting if it's the last day
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== day);
      }
      return [...prev, day];
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Repeat</Label>
        <Select value={frequency ?? "NONE"} onValueChange={handleFrequencyChange}>
          <SelectTrigger className={'w-full'}>
            {FREQUENCY_LABELS[frequency ?? "NONE"]}
          </SelectTrigger>
          <SelectContent>
            {allowNone && <SelectItem value="NONE">Don't repeat</SelectItem>}
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="WEEKLY">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {frequency === "WEEKLY" && (
        <div className="flex flex-col gap-2">
          <Label>Days</Label>
          <div className="flex gap-4 w-full">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDays.includes(day.value);
              return (
                <Toggle
                  key={day.value}
                  variant="outline"
                  className={'w-full aspect-square'}
                  pressed={isSelected}
                  onPressedChange={() => toggleDay(day.value)}
                >
                  {day.label}
                </Toggle>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
