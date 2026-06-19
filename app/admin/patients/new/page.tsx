import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { listTeamMembers } from "@/app/admin/actions";
import PatientForm from "@/components/admin/PatientForm";

export const metadata = { title: "New Patient — Admin" };

export default async function NewPatientPage() {
  const teamMembers = await listTeamMembers();
  const doctors = teamMembers.map((m) => ({
    id:    m.id,
    name:  m.name,
    title: m.title,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/patients"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-4"
        >
          <ChevronLeft className="size-4" />
          Back to Patients
        </Link>
        <h1 className="text-xl font-heading font-bold text-foreground">New Patient</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Create a patient record. You can link it to submissions later.
        </p>
      </div>

      <PatientForm doctors={doctors} />
    </div>
  );
}
