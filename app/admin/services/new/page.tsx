import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { listTeamMembers } from "@/app/admin/actions";
import ServiceForm from "@/components/admin/ServiceForm";

export const metadata = { title: "New Service — Admin" };

export default async function NewServicePage() {
  const teamMembers = await listTeamMembers();
  const doctors = teamMembers.map((m) => ({
    id:    m.id,
    name:  m.name,
    title: m.title,
    photo: m.photo ?? null,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/services"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-4"
        >
          <ChevronLeft className="size-4" />
          Back to Services
        </Link>
        <h1 className="text-xl font-heading font-bold text-foreground">New Service</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Add a new dental service to the public website.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm p-6">
        <ServiceForm doctors={doctors} />
      </div>
    </div>
  );
}
