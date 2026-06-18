"use client";

import { useState, useTransition } from "react";
import { rescheduleAppointment } from "../../actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CalendarClock, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface Doctor {
  id: string;
  name: string;
  title: string;
}

interface Props {
  id: string;
  doctors: Doctor[];
  currentDoctorId: string;
  currentScheduledAt: string;
  currentDuration: string;
  isTerminal: boolean;
  canWrite: boolean;
}

type Duration = "30" | "45" | "60" | "90" | "120";

const DURATION_LABELS: Record<Duration, string> = {
  "30": "30 min",
  "45": "45 min",
  "60": "60 min",
  "90": "90 min",
  "120": "2 hours",
};

function toInputValues(isoStr: string) {
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export default function RescheduleForm({
  id,
  doctors,
  currentDoctorId,
  currentScheduledAt,
  currentDuration,
  isTerminal,
  canWrite,
}: Props) {
  const [open, setOpen]             = useState(false);
  const [doctorId, setDoctorId]     = useState(currentDoctorId);
  const [duration, setDuration]     = useState<Duration>((currentDuration as Duration) ?? "60");
  const init                        = toInputValues(currentScheduledAt);
  const [date, setDate]             = useState(init.date);
  const [time, setTime]             = useState(init.time);
  const [pending, startTransition]  = useTransition();
  const router                      = useRouter();

  if (!canWrite || isTerminal) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newScheduledAt = new Date(`${date}T${time}:00`);
    if (isNaN(newScheduledAt.getTime())) {
      toast.error("Invalid date or time.");
      return;
    }

    startTransition(async () => {
      const result = await rescheduleAppointment(id, doctorId, newScheduledAt, { duration });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Appointment rescheduled.");
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-2.5 flex items-center gap-2 text-left"
      >
        <CalendarClock className="size-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground flex-1">Reschedule</span>
        <ChevronDown
          className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 flex flex-col gap-3 border-t border-border pt-3">
          {/* Doctor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Doctor</label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    <span className="font-medium">{d.name}</span>
                    <span className="text-muted-foreground"> — {d.title}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Duration</label>
            <Select value={duration} onValueChange={(v) => setDuration(v as Duration)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(DURATION_LABELS) as [Duration, string][]).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors w-fit"
          >
            {pending && <Loader2 className="size-3.5 animate-spin" />}
            {pending ? "Saving…" : "Confirm Reschedule"}
          </button>
        </form>
      )}
    </div>
  );
}
