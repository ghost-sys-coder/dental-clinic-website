"use client";

import { useState, useTransition } from "react";
import { createAvailabilityBlock, deleteAvailabilityBlock } from "@/app/admin/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2, PlusCircle, CalendarOff } from "lucide-react";

interface Block {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
}

interface Props {
  doctorId: string;
  initialBlocks: Block[];
  canWrite: boolean;
}

function fmt(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function localISODate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function AvailabilityBlockPanel({
  doctorId,
  initialBlocks,
  canWrite,
}: Props) {
  const router                      = useRouter();
  const [blocks, setBlocks]         = useState<Block[]>(initialBlocks);
  const [showForm, setShowForm]     = useState(false);
  const [startDate, setStartDate]   = useState(localISODate(new Date()));
  const [startTime, setStartTime]   = useState("08:00");
  const [endDate, setEndDate]       = useState(localISODate(new Date()));
  const [endTime, setEndTime]       = useState("09:00");
  const [reason, setReason]         = useState("");
  const [creating, startCreate]     = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startDelete]             = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const startsAt = new Date(`${startDate}T${startTime}:00`);
    const endsAt   = new Date(`${endDate}T${endTime}:00`);

    if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
      toast.error("Invalid date or time.");
      return;
    }

    startCreate(async () => {
      const result = await createAvailabilityBlock(
        doctorId,
        startsAt,
        endsAt,
        reason.trim() || undefined,
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Availability block added.");
        setShowForm(false);
        setReason("");
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startDelete(async () => {
      const result = await deleteAvailabilityBlock(id);
      setDeletingId(null);
      if (result.error) {
        toast.error(result.error);
      } else {
        setBlocks((prev) => prev.filter((b) => b.id !== id));
        toast.success("Block removed.");
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarOff className="size-3.5 text-primary" />
          <h2 className="text-xs font-semibold text-foreground">Availability Blocks</h2>
          {blocks.length > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {blocks.length}
            </span>
          )}
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <PlusCircle className="size-3.5" />
            Add Block
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && canWrite && (
        <form
          onSubmit={handleCreate}
          className="px-4 py-3 border-b border-border flex flex-col gap-3 bg-muted/20"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">
              Reason <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Staff meeting, Vacation"
              className="flex h-9 w-full rounded-lg border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {creating && <Loader2 className="size-3 animate-spin" />}
              {creating ? "Adding…" : "Add Block"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Block list */}
      {blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CalendarOff className="size-7 text-muted-foreground/30 mb-2" />
          <p className="text-xs text-muted-foreground">No blocked times set.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {blocks.map((b) => (
            <li key={b.id} className="flex items-start gap-3 px-4 py-3">
              <div className="flex flex-col flex-1 gap-0.5 min-w-0">
                <p className="text-xs font-medium text-foreground">
                  {fmt(b.startsAt)} – {fmt(b.endsAt)}
                </p>
                {b.reason && (
                  <p className="text-[10px] text-muted-foreground">{b.reason}</p>
                )}
              </div>
              {canWrite && (
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  disabled={deletingId === b.id}
                  aria-label="Delete block"
                  className="shrink-0 size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  {deletingId === b.id
                    ? <Loader2 className="size-3.5 animate-spin" />
                    : <Trash2 className="size-3.5" />
                  }
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
