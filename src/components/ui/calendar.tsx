import * as React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isAfter,
} from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

type Matcher = Date[] | ((date: Date) => boolean);

interface CalendarProps {
  className?: string;
  mode?: "single" | "multiple";
  selected?: Date | Date[];
  onSelect?: (date: Date | Date[] | undefined) => void;
  disabled?: Matcher;
  modifiers?: Record<string, Date[]>;
  modifiersClassNames?: Record<string, string>;
  defaultMonth?: Date;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  allowFutureDates?: boolean;
}

function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  disabled,
  modifiers = {},
  modifiersClassNames = {},
  defaultMonth,
  month: controlledMonth,
  onMonthChange,
  allowFutureDates = false,
}: CalendarProps) {
  const [internalMonth, setInternalMonth] = React.useState(
    defaultMonth ?? new Date(),
  );

  const currentMonth = controlledMonth ?? internalMonth;
  const setCurrentMonth = onMonthChange ?? setInternalMonth;

  const today = new Date();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const canGoNext =
    allowFutureDates ||
    !isAfter(startOfMonth(addMonths(currentMonth, 1)), today);

  const isSelected = (date: Date): boolean => {
    if (!selected) return false;
    if (Array.isArray(selected)) {
      return selected.some((d) => isSameDay(d, date));
    }
    return isSameDay(selected, date);
  };

  const isDisabled = (date: Date): boolean => {
    if (!disabled) return false;
    if (typeof disabled === "function") {
      return disabled(date);
    }
    return disabled.some((d) => isSameDay(d, date));
  };

  const getModifierClasses = (date: Date): string => {
    const classes: string[] = [];
    for (const [modifier, dates] of Object.entries(modifiers)) {
      if (dates.some((d) => isSameDay(d, date))) {
        const modifierClass = modifiersClassNames[modifier];
        if (modifierClass) {
          classes.push(modifierClass);
        }
      }
    }
    return classes.join(" ");
  };

  const handleDayClick = (date: Date) => {
    if (isDisabled(date) || !onSelect) return;

    if (mode === "single") {
      onSelect(date);
    } else if (mode === "multiple") {
      const selectedArray = Array.isArray(selected) ? selected : [];
      const isAlreadySelected = selectedArray.some((d) => isSameDay(d, date));
      if (isAlreadySelected) {
        onSelect(selectedArray.filter((d) => !isSameDay(d, date)));
      } else {
        onSelect([...selectedArray, date]);
      }
    }
  };

  return (
    <div data-slot="calendar" className={cn("p-3 bg-background", className)}>
      {/* Navigation */}
      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
          <CaretLeftIcon className="size-4" />
        </Button>
        <span className="text-sm font-medium select-none">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          disabled={!canGoNext}
        >
          <CaretRightIcon className="size-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-[0.8rem] font-normal select-none py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for padding */}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" />
        ))}

        {/* Day cells */}
        {days.map((date) => {
          const dateKey = format(date, "yyyy-MM-dd");
          const daySelected = isSelected(date);
          const dayDisabled = isDisabled(date);
          const dayToday = isSameDay(date, today);
          const dayOutside = !isSameMonth(date, currentMonth);
          const modifierClasses = getModifierClasses(date);

          return (
            <button
              key={dateKey}
              type="button"
              disabled={dayDisabled}
              onClick={() => handleDayClick(date)}
              className={cn(
                "aspect-square flex items-center justify-center text-sm rounded-4xl transition-colors select-none",
                "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                dayToday && "bg-muted font-medium",
                daySelected &&
                  !modifierClasses &&
                  "bg-primary text-primary-foreground",
                dayDisabled &&
                  "opacity-50 cursor-not-allowed hover:bg-transparent",
                dayOutside && "",
                modifierClasses,
              )}
            >
              {format(date, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
export type { CalendarProps, Matcher };
