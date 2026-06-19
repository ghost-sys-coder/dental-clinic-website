import Link from "next/link";
import Image from "next/image";
import { listServices } from "../actions";
import {
  Smile, Sparkles, HeartPulse, Shield, Scissors, Stethoscope,
  Activity, Baby, Star, Zap, Leaf, Sun, CheckCircle, AlertCircle,
  Layers, Wrench, FlaskConical, Syringe, Microscope, BrainCircuit,
  ImageIcon, Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Smile, Sparkles, HeartPulse, Shield, Scissors, Stethoscope,
  Activity, Baby, Star, Zap, Leaf, Sun, CheckCircle, AlertCircle,
  Layers, Wrench, FlaskConical, Syringe, Microscope, BrainCircuit,
};

export default async function ServicesPage() {
  const services = await listServices();

  return (
    <div className="flex flex-col gap-4 min-w-0">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl text-foreground">Services</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{services.length} service{services.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/services/new"
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center"
        >
          + Add Service
        </Link>
      </div>

      {/* Grid */}
      {services.length === 0 ? (
        <div className="rounded-xl border border-border bg-card shadow-sm py-16 text-center">
          <Layers className="size-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No services yet.</p>
          <Link
            href="/admin/services/new"
            className="mt-3 inline-flex h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold items-center hover:bg-primary/90 transition-colors"
          >
            Add your first service
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => {
            const Icon = s.icon ? ICON_MAP[s.icon] : null;
            return (
              <div
                key={s.id}
                className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-36 bg-muted flex items-center justify-center shrink-0">
                  {s.image ? (
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <ImageIcon className="size-8 text-muted-foreground/30" />
                  )}
                  {/* Active badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      s.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    {Icon && (
                      <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="size-3.5 text-primary" />
                      </div>
                    )}
                    <h3 className="font-semibold text-foreground text-sm truncate">{s.name}</h3>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                    {s.shortDescription}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="size-3.5" />
                      {s.doctorCount} doctor{s.doctorCount !== 1 ? "s" : ""}
                    </span>
                    <Link
                      href={`/admin/services/${s.id}`}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Edit →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
