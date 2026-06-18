const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  SCHEDULED:   { label: "Scheduled",   cls: "bg-blue-100 text-blue-700 border-blue-200" },
  CONFIRMED:   { label: "Confirmed",   cls: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  COMPLETED:   { label: "Completed",   cls: "bg-green-100 text-green-700 border-green-200" },
  NO_SHOW:     { label: "No Show",     cls: "bg-red-100 text-red-700 border-red-200" },
  CANCELLED:   { label: "Cancelled",   cls: "bg-gray-100 text-gray-500 border-gray-200" },
  RESCHEDULED: { label: "Rescheduled", cls: "bg-orange-100 text-orange-700 border-orange-200" },
};

export default function AppointmentStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    cls: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}
