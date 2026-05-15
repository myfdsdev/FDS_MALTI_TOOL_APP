import * as React from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getHours,
  getMinutes,
  isSameDay,
  isSameMonth,
  isToday,
  setHours,
  setMinutes,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateTimePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 12 }, (_, index) => index * 5);

function to12Hour(hours24: number) {
  if (hours24 === 0) return 12;
  if (hours24 > 12) return hours24 - 12;
  return hours24;
}

function to24Hour(hour12: number, meridiem: "AM" | "PM") {
  if (meridiem === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

export function DateTimePicker({
  value = null,
  onChange,
  disabled,
  placeholder = "No date",
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const initialDate = value ?? new Date();
  const [month, setMonth] = React.useState(startOfMonth(initialDate));
  const [draftDate, setDraftDate] = React.useState<Date | null>(value);
  const [focusedDate, setFocusedDate] = React.useState<Date>(value ?? new Date());
  const dayRefs = React.useRef(new Map<string, HTMLButtonElement>());

  React.useEffect(() => {
    if (!open) return;
    const next = value ?? new Date();
    setDraftDate(value);
    setFocusedDate(next);
    setMonth(startOfMonth(next));
  }, [open, value]);

  React.useEffect(() => {
    if (!open) return;
    const key = format(focusedDate, "yyyy-MM-dd");
    dayRefs.current.get(key)?.focus();
  }, [focusedDate, open]);

  const hour = draftDate ? to12Hour(getHours(draftDate)) : 12;
  const minute = draftDate ? Math.round(getMinutes(draftDate) / 5) * 5 : 0;
  const meridiem: "AM" | "PM" = draftDate && getHours(draftDate) >= 12 ? "PM" : "AM";

  const range = React.useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month), { weekStartsOn: 0 }),
        end: endOfWeek(endOfMonth(month), { weekStartsOn: 0 }),
      }),
    [month]
  );

  function updateDraft(nextDate: Date) {
    setDraftDate(nextDate);
    setFocusedDate(nextDate);
    setMonth(startOfMonth(nextDate));
  }

  function ensureDraft() {
    return draftDate ?? value ?? new Date();
  }

  function handleDaySelect(nextDay: Date) {
    const base = ensureDraft();
    updateDraft(
      setMinutes(setHours(nextDay, getHours(base)), Math.round(getMinutes(base) / 5) * 5)
    );
  }

  function handleTimeChange(nextHour12: number, nextMinute: number, nextMeridiem: "AM" | "PM") {
    const base = ensureDraft();
    const date = setMinutes(setHours(base, to24Hour(nextHour12, nextMeridiem)), nextMinute);
    updateDraft(date);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, day: Date) {
    let nextDate: Date | null = null;
    if (event.key === "ArrowRight") nextDate = addDays(day, 1);
    if (event.key === "ArrowLeft") nextDate = addDays(day, -1);
    if (event.key === "ArrowDown") nextDate = addDays(day, 7);
    if (event.key === "ArrowUp") nextDate = addDays(day, -7);

    if (nextDate) {
      event.preventDefault();
      setFocusedDate(nextDate);
      setMonth(startOfMonth(nextDate));
    }
  }

  function handleDone() {
    onChange?.(draftDate);
    setOpen(false);
  }

  function handleClear() {
    setDraftDate(null);
    onChange?.(null);
    setOpen(false);
  }

  function handleToday() {
    const now = new Date();
    updateDraft(now);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {value ? format(value, "MMM d, yyyy · h:mm a") : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(94vw,34rem)] p-4">
        <div className="grid gap-4 md:grid-cols-[1.4fr_0.9fr]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMonth((current) => subMonths(current, 1))}
                className="rounded-md p-1.5 hover:bg-accent"
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </button>
              <p className="text-sm font-semibold">{format(month, "MMMM yyyy")}</p>
              <button
                type="button"
                onClick={() => setMonth((current) => addMonths(current, 1))}
                className="rounded-md p-1.5 hover:bg-accent"
                aria-label="Next month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <span key={day} className="py-1">
                  {day}
                </span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1">
              {range.map((day) => {
                const selected = draftDate ? isSameDay(day, draftDate) : false;
                const todayCell = isToday(day);
                const key = format(day, "yyyy-MM-dd");

                return (
                  <button
                    key={key}
                    ref={(node) => {
                      if (node) dayRefs.current.set(key, node);
                      else dayRefs.current.delete(key);
                    }}
                    type="button"
                    onClick={() => handleDaySelect(day)}
                    onKeyDown={(event) => handleKeyDown(event, day)}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      !isSameMonth(day, month) && "text-muted-foreground/45",
                      selected && "bg-primary text-primary-foreground",
                      !selected && todayCell && "bg-muted font-semibold",
                      !selected && "hover:bg-accent"
                    )}
                    aria-pressed={selected}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Hour</p>
                <div className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-border p-1">
                  {HOURS.map((entry) => (
                    <button
                      key={entry}
                      type="button"
                      onClick={() => handleTimeChange(entry, minute, meridiem)}
                      className={cn(
                        "flex w-full items-center justify-center rounded-lg px-2 py-1.5 text-sm hover:bg-accent",
                        hour === entry && "bg-primary text-primary-foreground"
                      )}
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Minute</p>
                <div className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-border p-1">
                  {MINUTES.map((entry) => (
                    <button
                      key={entry}
                      type="button"
                      onClick={() => handleTimeChange(hour, entry, meridiem)}
                      className={cn(
                        "flex w-full items-center justify-center rounded-lg px-2 py-1.5 text-sm hover:bg-accent",
                        minute === entry && "bg-primary text-primary-foreground"
                      )}
                    >
                      {String(entry).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">AM/PM</p>
                <div className="space-y-1 rounded-xl border border-border p-1">
                  {(["AM", "PM"] as const).map((entry) => (
                    <button
                      key={entry}
                      type="button"
                      onClick={() => handleTimeChange(hour, minute, entry)}
                      className={cn(
                        "flex w-full items-center justify-center rounded-lg px-3 py-1.5 text-sm hover:bg-accent",
                        meridiem === entry && "bg-primary text-primary-foreground"
                      )}
                    >
                      {entry}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md border border-border px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
            >
              Today
            </button>
          </div>
          <button
            type="button"
            onClick={handleDone}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Done
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
