"use client";

import { useState, useTransition } from "react";
import { updateSubmissionStatus } from "../../actions";
import { toast } from "sonner";

type Status =
  | "NEW"
  | "CONTACTED"
  | "WAITING_FOR_RESPONSE"
  | "BOOKED"
  | "ATTENDED"
  | "TREATMENT_PLANNED"
  | "CONVERTED"
  | "LOST"
  | "ARCHIVED";

const STATUSES: Status[] = [
  "NEW",
  "CONTACTED",
  "WAITING_FOR_RESPONSE",
  "BOOKED",
  "ATTENDED",
  "TREATMENT_PLANNED",
  "CONVERTED",
  "LOST",
  "ARCHIVED",
];

const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  NEW:                  { label: "New",                  color: "bg-blue-50 text-blue-700 border-blue-200" },
  CONTACTED:            { label: "Contacted",            color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  WAITING_FOR_RESPONSE: { label: "Waiting for Response", color: "bg-orange-50 text-orange-700 border-orange-200" },
  BOOKED:               { label: "Booked",               color: "bg-green-50 text-green-700 border-green-200" },
  ATTENDED:             { label: "Attended",             color: "bg-teal-50 text-teal-700 border-teal-200" },
  TREATMENT_PLANNED:    { label: "Treatment Planned",    color: "bg-purple-50 text-purple-700 border-purple-200" },
  CONVERTED:            { label: "Converted",            color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  LOST:                 { label: "Lost",                 color: "bg-red-50 text-red-700 border-red-200" },
  ARCHIVED:             { label: "Archived",             color: "bg-gray-50 text-gray-600 border-gray-200" },
};

export default function StatusControl({ id, current }: { id: string; current: Status }) {
  const [status, setStatus] = useState<Status>(current);
  const [pending, startTransition] = useTransition();

  function handleChange(next: Status) {
    if (next === status) return;
    startTransition(async () => {
      try {
        await updateSubmissionStatus(id, next);
        setStatus(next);
        toast.success(`Status updated to ${STATUS_CONFIG[next].label}`);
      } catch {
        toast.error("Failed to update status");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((s) => {
        const { label, color } = STATUS_CONFIG[s];
        return (
          <button
            key={s}
            onClick={() => handleChange(s)}
            disabled={pending}
            className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all disabled:opacity-50 ${
              status === s
                ? color + " ring-2 ring-offset-1 ring-current/30"
                : "bg-card border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
