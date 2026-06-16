"use client";

import { useState, useTransition } from "react";
import { updateSubmissionStatus } from "../../actions";
import { toast } from "sonner";

const STATUSES = ["NEW", "CONTACTED", "BOOKED", "ARCHIVED"] as const;
type Status = typeof STATUSES[number];

const STATUS_COLOR: Record<Status, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  BOOKED: "bg-green-50 text-green-700 border-green-200",
  ARCHIVED: "bg-gray-50 text-gray-600 border-gray-200",
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
        toast.success(`Status updated to ${next}`);
      } catch {
        toast.error("Failed to update status");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => handleChange(s)}
          disabled={pending}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all disabled:opacity-50 ${
            status === s
              ? STATUS_COLOR[s] + " ring-2 ring-offset-1 ring-current/30"
              : "bg-card border-border text-muted-foreground hover:border-primary/40"
          }`}
        >
          {s.charAt(0) + s.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  );
}
