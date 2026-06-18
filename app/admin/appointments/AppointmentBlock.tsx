import Link from "next/link";
import AppointmentStatusBadge from "./AppointmentStatusBadge";

const STATUS_BG: Record<string, string> = {
  SCHEDULED:   "bg-blue-50 border-blue-200 hover:bg-blue-100",
  CONFIRMED:   "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
  IN_PROGRESS: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
  COMPLETED:   "bg-green-50 border-green-200 hover:bg-green-100",
  NO_SHOW:     "bg-red-50 border-red-200 hover:bg-red-100",
  CANCELLED:   "bg-gray-50 border-gray-200 hover:bg-gray-100",
  RESCHEDULED: "bg-orange-50 border-orange-200 hover:bg-orange-100",
};

interface Props {
  id: string;
  apptStatus: string;
  patientName: string;
  service: string | null;
  treatmentType: string | null;
  scheduledAt: Date;
  durationMinutes: number;
  top: number;
  height: number;
  showDoctor?: boolean;
  doctorName?: string;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function AppointmentBlock({
  id,
  apptStatus,
  patientName,
  service,
  treatmentType,
  scheduledAt,
  durationMinutes,
  top,
  height,
  showDoctor,
  doctorName,
}: Props) {
  const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);
  const bg = STATUS_BG[apptStatus] ?? "bg-muted border-border hover:bg-muted/80";
  const isShort = height < 48;

  return (
    <Link
      href={`/admin/appointments/${id}`}
      className={`absolute left-0.5 right-0.5 rounded-md border px-1.5 overflow-hidden transition-colors ${bg}`}
      style={{ top, height: Math.max(height, 20) }}
    >
      <div className="flex flex-col h-full py-1 gap-0.5 min-w-0">
        {isShort ? (
          <p className="text-[10px] font-semibold text-foreground truncate leading-tight">
            {formatTime(scheduledAt)} {treatmentType ?? service ?? patientName}
          </p>
        ) : (
          <>
            <p className="text-[10px] font-semibold text-foreground truncate leading-tight">
              {treatmentType ?? service ?? "Appointment"}
            </p>
            <p className="text-[9px] text-muted-foreground truncate leading-tight">{patientName}</p>
            {!isShort && height >= 64 && (
              <p className="text-[9px] text-muted-foreground truncate leading-tight">
                {formatTime(scheduledAt)} – {formatTime(endTime)}
              </p>
            )}
            {showDoctor && doctorName && height >= 80 && (
              <p className="text-[9px] text-muted-foreground truncate leading-tight italic">{doctorName}</p>
            )}
          </>
        )}
      </div>
    </Link>
  );
}
