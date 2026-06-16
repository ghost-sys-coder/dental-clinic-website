import { notFound } from "next/navigation";
import Link from "next/link";
import { getSubmission, getAssignment, listTeamMembers } from "../../actions";
import { getSessionRole } from "@/lib/auth";
import StatusControl from "./StatusControl";
import NoteForm from "./NoteForm";
import AssignmentPanel from "./AssignmentPanel";
import {
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  Tag,
  Globe,
} from "lucide-react";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const ACTION_DOT: Record<string, string> = {
  VIEW: "bg-muted-foreground/40",
  STATUS_CHANGE: "bg-primary",
  NOTE_ADD: "bg-green-500",
  EXPORT: "bg-yellow-500",
};

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [submission, assignment, doctors, userRole] = await Promise.all([
    getSubmission(id),
    getAssignment(id),
    listTeamMembers(),
    getSessionRole(),
  ]);
  const canWrite = userRole !== "VIEWER";
  if (!submission) notFound();

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <Link
        href="/admin/submissions"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="size-3.5" /> Back to submissions
      </Link>

      {/* Patient hero card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-base font-bold text-primary shrink-0">
            {initials(submission.fullName)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-lg text-foreground">
              {submission.fullName}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Received {formatDate(submission.createdAt)}
            </p>
          </div>
          {canWrite
            ? <StatusControl id={submission.id} current={submission.status} />
            : <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border">{submission.status}</span>
          }
        </div>
      </div>

      {/* Two-column info */}
      <div className="grid md:grid-cols-2 gap-3">
        {/* Contact info */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
            <Mail className="size-3.5 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">Contact Info</h2>
          </div>
          <div className="px-4 py-3 flex flex-col gap-3">
            <a
              href={`mailto:${submission.email}`}
              className="flex items-center gap-3 group"
            >
              <div className="size-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Mail className="size-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Email</p>
                <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {submission.email}
                </p>
              </div>
            </a>
            <a href={`tel:${submission.phone}`} className="flex items-center gap-3 group">
              <div className="size-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <Phone className="size-3.5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Phone</p>
                <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {submission.phone}
                </p>
              </div>
            </a>
            {submission.preferredDate && (
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                  <Calendar className="size-3.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Preferred Date</p>
                  <p className="text-sm text-foreground">{submission.preferredDate}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Request details */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
            <FileText className="size-3.5 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">Request Details</h2>
          </div>
          <div className="px-4 py-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="size-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <FileText className="size-3.5 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Type</p>
                <p className="text-sm text-foreground capitalize">{submission.type.toLowerCase()}</p>
              </div>
            </div>
            {submission.service && (
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                  <Tag className="size-3.5 text-teal-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Service</p>
                  <p className="text-sm text-foreground">{submission.service}</p>
                </div>
              </div>
            )}
            {submission.source && (
              <div className="flex items-center gap-3">
                <div className="size-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <Globe className="size-3.5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Source</p>
                  <p className="text-sm text-foreground">{submission.source}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient message */}
      {submission.message && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
            <MessageSquare className="size-3.5 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">Patient Message</h2>
          </div>
          <p className="px-4 py-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {submission.message}
          </p>
        </div>
      )}

      {/* Assignment — only visible for BOOKED submissions and editors/admins */}
      {canWrite && submission.status === "BOOKED" && (
        <AssignmentPanel
          submissionId={submission.id}
          doctors={doctors.map((d) => ({
            id: d.id,
            name: d.name,
            title: d.title,
            email: d.email,
          }))}
          existing={
            assignment
              ? {
                  teamMemberId: assignment.teamMemberId,
                  scheduledAt: assignment.scheduledAt,
                  doctorName: assignment.doctorName,
                  doctorTitle: assignment.doctorTitle,
                }
              : null
          }
        />
      )}

      {/* Internal notes */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-3.5 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">Internal Notes</h2>
          </div>
          {submission.notes.length > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {submission.notes.length}
            </span>
          )}
        </div>
        <div className="px-4 py-3 flex flex-col gap-3">
          {canWrite && <NoteForm submissionId={submission.id} />}
          {submission.notes.length > 0 ? (
            <ul className="flex flex-col gap-2 mt-1">
              {submission.notes.map((n) => (
                <li key={n.id} className="flex gap-2.5">
                  <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0 mt-0.5">
                    {(n.author?.fullName ?? n.author?.email ?? "S").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 rounded-lg bg-muted/50 border border-border px-3 py-2">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {n.author?.fullName ?? n.author?.email ?? "Staff"} ·{" "}
                      {formatDate(n.createdAt)}
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

      {/* Audit trail */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
          <Clock className="size-3.5 text-primary" />
          <h2 className="text-xs font-semibold text-foreground">Audit Trail</h2>
        </div>
        <div className="px-4 py-3">
          {submission.auditLogs.length > 0 ? (
            <ul className="relative flex flex-col gap-0">
              {/* Timeline line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
              {submission.auditLogs.map((log) => (
                <li key={log.id} className="flex items-start gap-3 py-1.5 relative">
                  <div
                    className={`size-3.5 rounded-full border-2 border-card shrink-0 mt-0.5 z-10 ${
                      ACTION_DOT[log.action] ?? "bg-muted-foreground/40"
                    }`}
                  />
                  <div className="flex-1 flex items-start justify-between gap-2 min-w-0">
                    <div>
                      <span className="text-xs font-medium text-foreground">{log.action}</span>
                      {log.detail && (
                        <span className="ml-2 text-xs text-muted-foreground">{log.detail}</span>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {log.actor?.fullName ?? log.actor?.email ?? "System"}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No audit events yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
