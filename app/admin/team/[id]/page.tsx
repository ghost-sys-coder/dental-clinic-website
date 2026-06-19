import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Pencil,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Tag,
  FileText,
  Inbox,
} from "lucide-react";
import { getTeamMember, getDoctorUpcomingAssignments, listAvailabilityBlocks } from "@/app/admin/actions";
import { getSessionRole } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import AvailabilityBlockPanel from "./AvailabilityBlockPanel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getTeamMember(id);
  return { title: member ? `${member.name} — Admin` : "Team Member — Admin" };
}

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function relativeTime(d: Date) {
  const diffMs = d.getTime() - Date.now();
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return "< 1 hour away";
  if (diffH < 24) return `${diffH}h away`;
  if (diffD === 1) return "Tomorrow";
  return `${diffD} days away`;
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [member, upcoming, availBlocks, userRole] = await Promise.all([
    getTeamMember(id),
    getDoctorUpcomingAssignments(id),
    listAvailabilityBlocks({ doctorId: id }),
    getSessionRole(),
  ]);

  if (!member) notFound();

  const canWrite = hasPermission(userRole, "content.update");
  const canManageAvailability = hasPermission(userRole, "appointment.manage_availability");

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-3.5" /> Back to Team
        </Link>
        {canWrite && (
          <Link
            href={`/admin/team/${member.id}/edit`}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-medium hover:bg-muted/60 transition-colors"
          >
            <Pencil className="size-3.5" />
            Edit Profile
          </Link>
        )}
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        <div className="p-5 flex flex-col sm:flex-row gap-5">
          {/* Photo */}
          <div className="relative size-24 sm:size-28 rounded-xl overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center">
            {member.photo ? (
              <Image
                src={member.photo}
                alt={member.name}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <User className="size-10 text-muted-foreground/30" />
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div>
              <h1 className="font-heading font-bold text-xl text-foreground">
                {member.name}
              </h1>
              <p className="text-sm text-primary font-medium">{member.title}</p>
            </div>

            {member.credentials.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {member.credentials.map((c) => (
                  <span
                    key={c}
                    className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground leading-relaxed">
              {member.bio}
            </p>

            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors w-fit"
              >
                <Mail className="size-3.5" />
                {member.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming appointments */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">
              Upcoming Appointments
            </h2>
          </div>
          {upcoming.length > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {upcoming.length}
            </span>
          )}
        </div>

        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Inbox className="size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No upcoming appointments.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map((appt) => (
              <li key={appt.id} className="flex items-start gap-4 px-4 py-3">
                {/* Time column */}
                <div className="flex flex-col items-center gap-0.5 shrink-0 min-w-[88px]">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                    <Clock className="size-3" />
                    {new Intl.DateTimeFormat("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(appt.scheduledAt)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(appt.scheduledAt)}
                  </span>
                  <span className="mt-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                    {relativeTime(appt.scheduledAt)}
                  </span>
                </div>

                {/* Divider */}
                <div className="w-px self-stretch bg-border shrink-0" />

                {/* Patient info */}
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">
                      {appt.patientName}
                    </p>
                    <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full capitalize">
                      {appt.type.toLowerCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {appt.service && (
                      <span className="flex items-center gap-1">
                        <Tag className="size-3" />
                        {appt.service}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Phone className="size-3" />
                      {appt.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" />
                      {appt.email}
                    </span>
                  </div>
                </div>

                {/* Link to full submission */}
                <Link
                  href={`/admin/submissions/${appt.submissionId}`}
                  className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FileText className="size-3.5" />
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Availability blocks */}
      <AvailabilityBlockPanel
        doctorId={member.id}
        initialBlocks={availBlocks.map((b) => ({
          id: b.id,
          startsAt: b.startsAt.toISOString(),
          endsAt: b.endsAt.toISOString(),
          reason: b.reason,
        }))}
        canWrite={canManageAvailability}
      />
    </div>
  );
}
