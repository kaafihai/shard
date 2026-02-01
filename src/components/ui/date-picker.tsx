import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import { Calendar } from "./calendar";
import { Button } from "./button";
import { CalendarBlankIcon, XIcon } from "@phosphor-icons/react";
import { format } from "date-fns";

interface DatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={<Button className="bg-input/10" variant="ghost" />}
          className="flex-1 px-2 justify-start text-left font-normal"
        >
          <CalendarBlankIcon data-icon="inline-start" className="size-4" />
          {value ? (
            format(new Date(value), "PPP")
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </DialogTrigger>
        <DialogContent className="items-center" showCloseButton={false}>
          <Calendar
            className="w-full flex-1"
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => {
              if (date && !Array.isArray(date)) {
                // Create a date at midnight in local timezone, then convert to ISO
                const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                onChange(localMidnight.toISOString());
                setOpen(false);
              }
            }}
            allowFutureDates
          />
        </DialogContent>
      </Dialog>
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange(null)}
          className="text-muted-foreground"
        >
          <XIcon className="size-4" />
        </Button>
      )}
    </div>
  );
}
