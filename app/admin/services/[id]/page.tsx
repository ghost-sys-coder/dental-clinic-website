import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock } from "lucide-react";
import { getService, listTeamMembers } from "@/app/admin/actions";
import ServiceForm from "@/components/admin/ServiceForm";
import DeleteServiceButton from "./DeleteServiceButton";

export const metadata = { title: "Edit Service — Admin" };

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(d);
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [service, teamMembers] = await Promise.all([
    getService(id),
    listTeamMembers(),
  ]);

  if (!service) notFound();

  const doctors = teamMembers.map((m) => ({
    id:    m.id,
    name:  m.name,
    title: m.title,
    photo: m.photo ?? null,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Back + header */}
      <div>
        <Link
          href="/admin/services"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit mb-4"
        >
          <ChevronLeft className="size-4" />
          Back to Services
        </Link>

        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-heading font-bold text-foreground">
                {service.name}
              </h1>
              <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                service.isActive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}>
                {service.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 font-mono">/services/{service.slug}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              Created {fmtDate(service.createdAt)}
            </span>
            {service.updatedAt > service.createdAt && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                Updated {fmtDate(service.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="rounded-xl border border-border bg-card shadow-sm p-6">
        <ServiceForm
          doctors={doctors}
          initialData={{
            id:               service.id,
            slug:             service.slug,
            name:             service.name,
            icon:             service.icon ?? null,
            shortDescription: service.shortDescription,
            longDescription:  service.longDescription ?? null,
            image:            service.image ?? null,
            displayOrder:     service.displayOrder,
            isActive:         service.isActive,
            doctorIds:        service.doctorIds,
          }}
        />
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h3 className="text-sm font-semibold text-foreground mb-1">Danger Zone</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Permanently deletes this service and all doctor links. This cannot be undone.
        </p>
        <DeleteServiceButton id={service.id} name={service.name} />
      </div>
    </div>
  );
}
