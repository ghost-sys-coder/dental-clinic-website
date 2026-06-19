import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock } from "lucide-react";
import { getPatient, listTeamMembers } from "@/app/admin/actions";
import PatientForm from "@/components/admin/PatientForm";

export const metadata = { title: "Patient — Admin" };

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  NEW:      { label: "New",      cls: "bg-blue-50 text-blue-700 border-blue-200" },
  ACTIVE:   { label: "Active",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  INACTIVE: { label: "Inactive", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  ARCHIVED: { label: "Archived", cls: "bg-gray-100 text-gray-500 border-gray-200" },
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

  const [patient, teamMembers] = await Promise.all([
    getPatient(id),
    listTeamMembers(),
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
    </div>
  );
}
