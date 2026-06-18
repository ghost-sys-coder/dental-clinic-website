import { getWeekAppointments, listTeamMembers } from "../actions";
import WeekNav from "./WeekNav";
import WeekCalendar from "./WeekCalendar";
import { CalendarDays } from "lucide-react";

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseWeekParam(param?: string): Date {
  if (param && /^\d{4}-\d{2}-\d{2}$/.test(param)) {
    const d = new Date(param + "T00:00:00");
    if (!isNaN(d.getTime())) return d;
  }
  return getMonday(new Date());
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const weekStart = parseWeekParam(week);
  const weekKey   = weekStart.toISOString().slice(0, 10);

  const [{ appointments, blocks }, doctors] = await Promise.all([
    getWeekAppointments(weekStart),
    listTeamMembers(),
  ]);

  // Serialize dates to ISO strings for client components
  const serializedAppts = appointments.map((a) => ({
    ...a,
    scheduledAt: a.scheduledAt.toISOString(),
  }));

  const serializedBlocks = blocks.map((b) => ({
    ...b,
    startsAt: b.startsAt.toISOString(),
    endsAt:   b.endsAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-5 text-primary" />
          <h1 className="font-heading font-bold text-xl text-foreground">Appointments</h1>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {appointments.length}
          </span>
        </div>
        <WeekNav weekStart={weekKey} />
      </div>

      <WeekCalendar
        appointments={serializedAppts}
        blocks={serializedBlocks}
        doctors={doctors.map((d) => ({ id: d.id, name: d.name }))}
        weekStart={weekKey}
      />
    </div>
  );
}
