import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock, FileText } from "lucide-react";
import { getPatient, listTeamMembers, listPatientSubmissions } from "@/app/admin/actions";
import PatientForm from "@/components/admin/PatientForm";

export const metadata = { title: "Patient — Admin" };

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  NEW:      { label: "New",      cls: "bg-blue-50 text-blue-700 border-blue-200" },
  ACTIVE:   { label: "Active",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  INACTIVE: { label: "Inactive", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  ARCHIVED: { label: "Archived", cls: "bg-gray-100 text-gray-500 border-gray-200" },
};

const SUB_STATUS_CLS: Record<string, string> = {
  NEW:                  "bg-slate-100 text-slate-600 border-slate-200",
  CONTACTED:            "bg-blue-50 text-blue-700 border-blue-200",
  WAITING_FOR_RESPONSE: "bg-yellow-50 text-yellow-700 border-yellow-200",
  BOOKED:               "bg-violet-50 text-violet-700 border-violet-200",
  ATTENDED:             "bg-teal-50 text-teal-700 border-teal-200",
  TREATMENT_PLANNED:    "bg-cyan-50 text-cyan-700 border-cyan-200",
  CONVERTED:            "bg-emerald-50 text-emerald-700 border-emerald-200",
  LOST:                 "bg-red-50 text-red-700 border-red-200",
  ARCHIVED:             "bg-gray-100 text-gray-500 border-gray-200",
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour:  "numeric", minute: "2-digit",
  }).format(d);
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [patient, teamMembers, linkedSubmissions] = await Promise.all([
    getPatient(id),
    listTeamMembers(),
    listPatientSubmissions(id),
  ]);

  if (!patient) notFound();

  const doctors = teamMembers.map((m) => ({
    id:    m.id,
    name:  m.name,
    title: m.title,
  }));

  const statusCfg = STATUS_CONFIG[patient.status] ?? STATUS_CONFIG.NEW;

  return (
    <div className="flex flex-col gap-6">
      {/* Back + header */}
      <div>
        <Link
          href="/admin/patients"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-4"
        >
          <ChevronLeft className="size-4" />
          Back to Patients
        </Link>

        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-heading font-bold text-foreground">
                {patient.fullName}
              </h1>
              <span
                className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.cls}`}
              >
                {statusCfg.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{patient.email}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              Created {fmtDate(patient.createdAt)}
            </span>
            {patient.updatedAt && patient.updatedAt > patient.createdAt && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                Updated {fmtDate(patient.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="rounded-xl border border-border bg-card shadow-sm p-6">
        <PatientForm
          doctors={doctors}
          initialData={{
            id:                patient.id,
            fullName:          patient.fullName,
            email:             patient.email,
            phone:             patient.phone,
            dateOfBirth:       patient.dateOfBirth ?? null,
            gender:            patient.gender ?? null,
            address:           patient.address ?? null,
            emergencyContact:  patient.emergencyContact ?? null,
            medicalAlerts:     patient.medicalAlerts,
            allergies:         patient.allergies,
            insuranceProvider: patient.insuranceProvider ?? null,
            preferredDoctorId: patient.preferredDoctorId ?? null,
            status:            patient.status,
          }}
        />
      </div>

      {/* Linked submissions */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-3.5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Linked Submissions</h2>
          </div>
          {linkedSubmissions.length > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {linkedSubmissions.length}
            </span>
          )}
        </div>

        {linkedSubmissions.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">No submissions linked to this patient yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Open a submission and use the Patient Record panel to link it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Date</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Name</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Service</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {linkedSubmissions.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(s.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-foreground text-xs">{s.fullName}</p>
                      <p className="text-[11px] text-muted-foreground">{s.email}</p>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {s.service ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${SUB_STATUS_CLS[s.status] ?? SUB_STATUS_CLS.NEW}`}>
                        {s.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`/admin/submissions/${s.id}`}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
