import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAppointmentDetail,
  listNotesBySubmission,
  listTeamMembers,
} from "../../actions";
import { getSessionRole } from "@/lib/auth";
import AppointmentStatusBadge from "../AppointmentStatusBadge";
import StatusActions from "./StatusActions";
import RescheduleForm from "./RescheduleForm";
import CancelForm from "./CancelForm";
import AppointmentNoteForm from "./AppointmentNoteForm";
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  Stethoscope,
  Clock,
  DoorOpen,
  Calendar,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

const TERMINAL = ["COMPLETED", "NO_SHOW", "CANCELLED", "RESCHEDULED"];

function fmt(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function fmtNote(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

const DURATION_LABELS: Record<string, string> = {
  "30": "30 min",
  "45": "45 min",
  "60": "60 min",
  "90": "90 min",
  "120": "2 hours",
};

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [appt, role, doctors] = await Promise.all([
    getAppointmentDetail(id),
    getSessionRole(),
    listTeamMembers(),
  ]);

  if (!appt) notFound();

  const notes = await listNotesBySubmission(appt.submissionId);

  const canWrite = role !== "VIEWER";
  const isPast   = appt.scheduledAt < new Date();
  const isTerminal = TERMINAL.includes(appt.apptStatus);

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <Link
        href="/admin/appointments"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="size-3.5" /> Back to appointments
      </Link>

      {/* Hero card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading font-bold text-lg text-foreground">
                {appt.patientName}
              </h1>
              <AppointmentStatusBadge status={appt.apptStatus} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {fmt(appt.scheduledAt)}
              {" · "}
              {DURATION_LABELS[appt.duration] ?? `${appt.duration} min`}
              {appt.roomOrChair && ` · ${appt.roomOrChair}`}
            </p>
          </div>

          <StatusActions
            id={appt.id}
            apptStatus={appt.apptStatus}
            isPast={isPast}
            canWrite={canWrite}
          />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid md:grid-cols-2 gap-3">
        {/* Patient info */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="size-3.5 text-primary" />
              <h2 className="text-xs font-semibold text-foreground">Patient</h2>
            </div>
            <Link
              href={`/admin/submissions/${appt.submissionId}`}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              View submission <ExternalLink className="size-3" />
            </Link>
          </div>
          <div className="px-4 py-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="size-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Mail className="size-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Email</p>
                <a
                  href={`mailto:${appt.patientEmail}`}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  {appt.patientEmail}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <Phone className="size-3.5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Phone</p>
                <a
                  href={`tel:${appt.patientPhone}`}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  {appt.patientPhone}
                </a>
              </div>
            </div>
            {appt.service && (
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                  <Stethoscope className="size-3.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Requested Service</p>
                  <p className="text-sm text-foreground">{appt.service}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Appointment details */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
            <Calendar className="size-3.5 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">Appointment Details</h2>
          </div>
          <div className="px-4 py-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="size-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <User className="size-3.5 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Doctor</p>
                <Link
                  href={`/admin/team/${appt.teamMemberId}`}
                  className="text-sm text-foreground hover:text-primary transition-colors"
                >
                  {appt.doctorName}
                  {appt.doctorTitle && (
                    <span className="text-muted-foreground"> — {appt.doctorTitle}</span>
                  )}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Clock className="size-3.5 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Duration</p>
                <p className="text-sm text-foreground">
                  {DURATION_LABELS[appt.duration] ?? `${appt.duration} min`}
                </p>
              </div>
            </div>
            {appt.treatmentType && (
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <Stethoscope className="size-3.5 text-teal-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Treatment</p>
                  <p className="text-sm text-foreground">{appt.treatmentType}</p>
                </div>
              </div>
            )}
            {appt.roomOrChair && (
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                  <DoorOpen className="size-3.5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Room / Chair</p>
                  <p className="text-sm text-foreground">{appt.roomOrChair}</p>
                </div>
              </div>
            )}
            {appt.followUpDate && (
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                  <Calendar className="size-3.5 text-rose-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Follow-up Date</p>
                  <p className="text-sm text-foreground">{appt.followUpDate}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule + Cancel */}
      {canWrite && (
        <>
          <RescheduleForm
            id={appt.id}
            doctors={doctors.map((d) => ({ id: d.id, name: d.name, title: d.title }))}
            currentDoctorId={appt.teamMemberId}
            currentScheduledAt={appt.scheduledAt.toISOString()}
            currentDuration={appt.duration}
            isTerminal={isTerminal}
            canWrite={canWrite}
          />
          <CancelForm
            id={appt.id}
            apptStatus={appt.apptStatus}
            existingReason={appt.cancellationReason}
            canWrite={canWrite}
          />
        </>
      )}

      {/* Notes */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-3.5 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">Internal Notes</h2>
          </div>
          {notes.length > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {notes.length}
            </span>
          )}
        </div>
        <div className="px-4 py-3 flex flex-col gap-3">
          {canWrite && <AppointmentNoteForm submissionId={appt.submissionId} />}
          {notes.length > 0 ? (
            <ul className="flex flex-col gap-2 mt-1">
              {notes.map((n) => (
                <li key={n.id} className="flex gap-2.5">
                  <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0 mt-0.5">
                    {(n.authorName ?? n.authorEmail ?? "S").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 rounded-lg bg-muted/50 border border-border px-3 py-2">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {n.authorName ?? n.authorEmail ?? "Staff"} · {fmtNote(n.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No notes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
