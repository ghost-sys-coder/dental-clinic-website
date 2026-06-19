import { listPatients } from "../actions";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, UserRound } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUSES = ["NEW", "ACTIVE", "INACTIVE", "ARCHIVED"] as const;
type Status = typeof STATUSES[number];

const STATUS_CONFIG: Record<Status, { label: string; cls: string }> = {
  NEW:      { label: "New",      cls: "bg-blue-50 text-blue-700 border border-blue-200" },
  ACTIVE:   { label: "Active",   cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  INACTIVE: { label: "Inactive", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
  ARCHIVED: { label: "Archived", cls: "bg-gray-100 text-gray-500 border border-gray-200" },
};

const GENDER_LABEL: Record<string, string> = {
  MALE:              "Male",
  FEMALE:            "Female",
  OTHER:             "Other",
  PREFER_NOT_TO_SAY: "—",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(val: string | Date | null | undefined) {
  if (!val) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  }).format(new Date(val));
}

function fmtDob(iso: string | null | undefined) {
  if (!iso) return "—";
  // ISO date string YYYY-MM-DD — parse without timezone shift
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })
    .format(new Date(y, m - 1, d));
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = STATUSES.includes(params.status as Status)
    ? (params.status as Status)
    : undefined;
  const query = params.q?.trim() || undefined;
  const page  = Math.max(1, Number(params.page ?? 1));

  const { rows, total, pageSize } = await listPatients({ status, query, page });
  const totalPages = Math.ceil(total / pageSize);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { status: params.status, q: params.q, page: params.page, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    return `/admin/patients?${p.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} total</p>
        </div>
        <Link
          href="/admin/patients/new"
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center"
        >
          + Add Patient
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search name, email, phone…"
            className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {params.status && <input type="hidden" name="status" value={params.status} />}
        </form>

        <div className="flex gap-1.5 flex-wrap">
          {(["", ...STATUSES] as const).map((s) => {
            const isAll    = s === "";
            const isActive = isAll ? !status : status === s;
            const label    = isAll ? "All" : STATUS_CONFIG[s].label;
            const href     = isAll
              ? buildUrl({ status: undefined, page: "1" })
              : buildUrl({ status: s, page: "1" });
            return (
              <Link
                key={s}
                href={href}
                className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <UserRound className="size-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No patients found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {[
                  "Patient",
                  "Phone",
                  "DOB / Gender",
                  "Address",
                  "Emergency Contact",
                  "Alerts",
                  "Insurance",
                  "Preferred Doctor",
                  "Status",
                  "Created",
                  "Last Visit",
                  "Next Visit",
                  "",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2.5"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((r) => {
                const cfg = STATUS_CONFIG[r.status as Status] ?? STATUS_CONFIG.NEW;
                const alertCount    = r.medicalAlerts.length;
                const allergyCount  = r.allergies.length;

                return (
                  <TableRow key={r.id} className="text-sm">

                    {/* Patient — avatar + name + email */}
                    <TableCell className="px-3 py-2.5 min-w-45">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                          {initials(r.fullName)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{r.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="px-3 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                      {r.phone}
                    </TableCell>

                    {/* DOB / Gender */}
                    <TableCell className="px-3 py-2.5 min-w-30">
                      <p className="text-xs text-foreground">{fmtDob(r.dateOfBirth)}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.gender ? GENDER_LABEL[r.gender] ?? r.gender : "—"}
                      </p>
                    </TableCell>

                    {/* Address */}
                    <TableCell className="px-3 py-2.5 text-xs text-muted-foreground max-w-40">
                      <span className="block truncate" title={r.address ?? undefined}>
                        {r.address ?? "—"}
                      </span>
                    </TableCell>

                    {/* Emergency Contact */}
                    <TableCell className="px-3 py-2.5 text-xs text-muted-foreground max-w-40">
                      <span className="block truncate" title={r.emergencyContact ?? undefined}>
                        {r.emergencyContact ?? "—"}
                      </span>
                    </TableCell>

                    {/* Alerts & Allergies */}
                    <TableCell className="px-3 py-2.5">
                      <div className="flex flex-col gap-0.5">
                        {alertCount > 0 ? (
                          <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 w-fit">
                            {alertCount} alert{alertCount > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">No alerts</span>
                        )}
                        {allergyCount > 0 ? (
                          <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 w-fit">
                            {allergyCount} allerg{allergyCount > 1 ? "ies" : "y"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">No allergies</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Insurance */}
                    <TableCell className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {r.insuranceProvider ?? "—"}
                    </TableCell>

                    {/* Preferred Doctor */}
                    <TableCell className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {r.preferredDoctorName ?? "—"}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-3 py-2.5">
                      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </TableCell>

                    {/* Created */}
                    <TableCell className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(r.createdAt)}
                    </TableCell>

                    {/* Last Visit */}
                    <TableCell className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {fmtDate(r.lastVisit)}
                    </TableCell>

                    {/* Next Visit */}
                    <TableCell className="px-3 py-2.5 text-xs whitespace-nowrap">
                      {r.nextVisit ? (
                        <span className="text-primary font-medium">{fmtDate(r.nextVisit)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    {/* View link */}
                    <TableCell className="px-3 py-2.5 text-right">
                      <Link
                        href={`/admin/patients/${r.id}`}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        View →
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="flex items-center gap-1 h-8 px-3 rounded-lg border border-border bg-card text-xs text-foreground hover:border-primary/40 transition-colors"
              >
                <ChevronLeft className="size-3.5" /> Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="flex items-center gap-1 h-8 px-3 rounded-lg border border-border bg-card text-xs text-foreground hover:border-primary/40 transition-colors"
              >
                Next <ChevronRight className="size-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
