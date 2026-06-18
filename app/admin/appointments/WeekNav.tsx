"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface Props {
  weekStart: string; // ISO date string (Monday)
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

function formatWeekLabel(isoDate: string): string {
  const start = new Date(isoDate + "T00:00:00");
  const end = new Date(isoDate + "T00:00:00");
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}

function thisWeekMonday(): string {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return toDateKey(d);
}

export default function WeekNav({ weekStart }: Props) {
  const router = useRouter();
  const prev   = addDays(weekStart, -7);
  const next   = addDays(weekStart, 7);
  const today  = thisWeekMonday();
  const isThisWeek = weekStart === today;

  function go(isoDate: string) {
    router.push(`/admin/appointments?week=${isoDate}`);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => go(prev)}
        className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        aria-label="Previous week"
      >
        <ChevronLeft className="size-4" />
      </button>

      <span className="text-sm font-medium text-foreground min-w-[180px] text-center">
        {formatWeekLabel(weekStart)}
      </span>

      <button
        onClick={() => go(next)}
        className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        aria-label="Next week"
      >
        <ChevronRight className="size-4" />
      </button>

      {!isThisWeek && (
        <button
          onClick={() => go(today)}
          className="h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-1.5"
        >
          <CalendarDays className="size-3.5" />
          Today
        </button>
      )}
    </div>
  );
}
