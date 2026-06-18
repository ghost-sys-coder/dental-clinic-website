"use client";

import { useTransition } from "react";
import { updateAppointmentStatus, markNoShow } from "../../actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, PlayCircle, BadgeCheck, UserX } from "lucide-react";

interface Props {
  id: string;
  apptStatus: string;
  isPast: boolean;
  canWrite: boolean;
}

const ACTIONS: Record<
  string,
  { label: string; nextStatus: string; icon: React.ElementType; cls: string }[]
> = {
  SCHEDULED: [
    { label: "Confirm",   nextStatus: "CONFIRMED",   icon: CheckCircle2, cls: "bg-indigo-600 text-white hover:bg-indigo-700" },
  ],
  CONFIRMED: [
    { label: "Check In",  nextStatus: "IN_PROGRESS", icon: PlayCircle,   cls: "bg-yellow-500 text-white hover:bg-yellow-600" },
  ],
  IN_PROGRESS: [
    { label: "Complete",  nextStatus: "COMPLETED",   icon: BadgeCheck,   cls: "bg-green-600 text-white hover:bg-green-700" },
  ],
};

export default function StatusActions({ id, apptStatus, isPast, canWrite }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!canWrite) return null;

  const primaryActions = ACTIONS[apptStatus] ?? [];
  const showNoShow = isPast && ["SCHEDULED", "CONFIRMED"].includes(apptStatus);

  if (primaryActions.length === 0 && !showNoShow) return null;

  function act(nextStatus: string) {
    startTransition(async () => {
      const result = nextStatus === "NO_SHOW"
        ? await markNoShow(id)
        : await updateAppointmentStatus(id, nextStatus as never);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Status updated to ${nextStatus.replace("_", " ").toLowerCase()}`);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {primaryActions.map(({ label, nextStatus, icon: Icon, cls }) => (
        <button
          key={nextStatus}
          onClick={() => act(nextStatus)}
          disabled={pending}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 ${cls}`}
        >
          {pending ? <Loader2 className="size-3 animate-spin" /> : <Icon className="size-3" />}
          {label}
        </button>
      ))}

      {showNoShow && (
        <button
          onClick={() => act("NO_SHOW")}
          disabled={pending}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 transition-colors disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-3 animate-spin" /> : <UserX className="size-3" />}
          No Show
        </button>
      )}
    </div>
  );
}
