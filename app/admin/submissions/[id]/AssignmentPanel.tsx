"use client";

import { useState, useTransition } from "react";
import { assignSubmission } from "../../actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserCheck, CalendarClock } from "lucide-react";
import { toast } from "sonner";

interface Doctor {
  id: string;
  name: string;
  title: string;
  email: string | null;
}

interface ExistingAssignment {
  teamMemberId: string;
  scheduledAt: Date;
  doctorName: string;
  doctorTitle: string;
  duration: string;
  treatmentType: string | null;
  roomOrChair: string | null;
}

interface Props {
  submissionId: string;
  doctors: Doctor[];
  existing: ExistingAssignment | null;
}

type Duration = "30" | "45" | "60" | "90" | "120";

const DURATION_LABELS: Record<Duration, string> = {
  "30": "30 min",
  "45": "45 min",
  "60": "60 min",
  "90": "90 min",
  "120": "2 hours",
};

function toLocalDateTimeInputs(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export default function AssignmentPanel({ submissionId, doctors, existing }: Props) {
  const existingInputs = existing ? toLocalDateTimeInputs(existing.scheduledAt) : null;

  const [doctorId, setDoctorId]           = useState(existing?.teamMemberId ?? "");
  const [date, setDate]                   = useState(existingInputs?.date ?? "");
  const [time, setTime]                   = useState(existingInputs?.time ?? "");
  const [duration, setDuration]           = useState<Duration>((existing?.duration as Duration) ?? "60");
  const [treatmentType, setTreatmentType] = useState(existing?.treatmentType ?? "");
  const [roomOrChair, setRoomOrChair]     = useState(existing?.roomOrChair ?? "");
  const [pending, startTransition]        = useTransition();

  const isReassign = !!existing;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!doctorId || !date || !time) {
      toast.error("Please select a doctor and a date/time.");
      return;
    }

    const scheduledAt = new Date(`${date}T${time}:00`);
    if (isNaN(scheduledAt.getTime())) {
      toast.error("Invalid date or time.");
      return;
    }

    startTransition(async () => {
      const result = await assignSubmission(submissionId, doctorId, scheduledAt, {
        duration,
        treatmentType: treatmentType.trim() || undefined,
        roomOrChair: roomOrChair.trim() || undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isReassign ? "Assignment updated." : "Appointment assigned.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
        <UserCheck className="size-3.5 text-primary" />
        <h2 className="text-xs font-semibold text-foreground">Assign Doctor</h2>
        {existing && (
          <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
            Assigned
          </span>
        )}
      </div>

      {/* Current assignment summary */}
      {existing && (
        <div className="px-4 pt-3 pb-1 flex items-center gap-2.5">
          <CalendarClock className="size-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Currently assigned to{" "}
            <span className="font-medium text-foreground">{existing.doctorName}</span>
            {" · "}
            {existing.scheduledAt.toLocaleDateString("en-US", {
              weekday: "short", month: "short", day: "numeric", year: "numeric",
            })}{" "}
            at{" "}
            {existing.scheduledAt.toLocaleTimeString("en-US", {
              hour: "numeric", minute: "2-digit",
            })}
            {" · "}
            {DURATION_LABELS[existing.duration as Duration] ?? `${existing.duration} min`}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-4 py-3 flex flex-col gap-3">
        {/* Doctor select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-foreground">Doctor</label>
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select a doctor…" />
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

        {/* Date + time + duration */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="assign-date" className="text-xs font-medium text-foreground">
              Date
            </label>
            <input
              id="assign-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="assign-time" className="text-xs font-medium text-foreground">
              Time
            </label>
            <input
              id="assign-time"
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

        {/* Treatment type + room */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="assign-treatment" className="text-xs font-medium text-foreground">
              Treatment Type <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="assign-treatment"
              type="text"
              value={treatmentType}
              onChange={(e) => setTreatmentType(e.target.value)}
              placeholder="e.g. Cleaning"
              className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="assign-room" className="text-xs font-medium text-foreground">
              Room / Chair <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              id="assign-room"
              type="text"
              value={roomOrChair}
              onChange={(e) => setRoomOrChair(e.target.value)}
              placeholder="e.g. Chair 1"
              className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors w-fit"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {pending ? "Saving…" : isReassign ? "Update Assignment" : "Assign Doctor"}
        </button>
      </form>
    </div>
  );
}
