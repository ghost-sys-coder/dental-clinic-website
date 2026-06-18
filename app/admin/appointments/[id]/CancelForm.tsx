"use client";

import { useState, useTransition } from "react";
import { cancelAppointment } from "../../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, XCircle } from "lucide-react";

interface Props {
  id: string;
  apptStatus: string;
  existingReason: string | null;
  canWrite: boolean;
}

const TERMINAL = ["COMPLETED", "NO_SHOW", "CANCELLED", "RESCHEDULED"];

export default function CancelForm({ id, apptStatus, existingReason, canWrite }: Props) {
  const [reason, setReason]         = useState("");
  const [pending, startTransition]  = useTransition();
  const router                      = useRouter();

  const isCancelled = apptStatus === "CANCELLED";
  const isTerminal  = TERMINAL.includes(apptStatus);

  if (!canWrite && !isCancelled) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await cancelAppointment(id, reason.trim() || undefined);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Appointment cancelled.");
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-xl border border-destructive/30 bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-destructive/20 bg-destructive/5 flex items-center gap-2">
        <XCircle className="size-3.5 text-destructive" />
        <h2 className="text-xs font-semibold text-destructive">Cancel Appointment</h2>
      </div>

      {isCancelled ? (
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground">
            This appointment was cancelled.
            {existingReason && (
              <> Reason: <span className="text-foreground font-medium">{existingReason}</span></>
            )}
          </p>
        </div>
      ) : isTerminal ? (
        <div className="px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Appointment is {apptStatus.toLowerCase().replace("_", " ")} — cancellation not available.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-4 py-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Reason <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Patient requested cancellation"
              rows={2}
              disabled={pending}
              className="flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 disabled:opacity-60 transition-colors w-fit"
          >
            {pending && <Loader2 className="size-3.5 animate-spin" />}
            {pending ? "Cancelling…" : "Cancel Appointment"}
          </button>
        </form>
      )}
    </div>
  );
}
