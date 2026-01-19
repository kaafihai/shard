import { Dialog, DialogClose, DialogContent, DialogTrigger } from "./dialog";
import { Calendar, CalendarDayButton } from "./calendar";
import { Button } from "./button";
import { CalendarBlankIcon } from "@phosphor-icons/react";
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
  return (
    <Dialog>
      <DialogTrigger
        render={<Button className={'bg-input/30'} variant={'ghost'} />}
        className="w-full px-2 justify-start text-left font-normal"
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
          onSelect={(date) =>
            onChange(date ? format(date, "yyyy-MM-dd") : null)
          }
          components={{
            DayButton: (props) => (
              <DialogClose render={<CalendarDayButton {...props} />} />
            ),
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
