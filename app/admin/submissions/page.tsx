import { listSubmissions } from "../actions";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, Inbox } from "lucide-react";

const STATUSES = ["NEW", "CONTACTED", "BOOKED", "ARCHIVED"] as const;
type Status = typeof STATUSES[number];

const STATUS_COLOR: Record<Status, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  BOOKED: "bg-green-50 text-green-700 border-green-200",
  ARCHIVED: "bg-gray-50 text-gray-600 border-gray-200",
};

const STATUS_ROW_ACCENT: Record<Status, string> = {
  NEW: "border-l-blue-400",
  CONTACTED: "border-l-yellow-400",
  BOOKED: "border-l-green-400",
  ARCHIVED: "border-l-gray-300",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = STATUSES.includes(params.status as Status)
    ? (params.status as Status)
    : undefined;
  const query = params.q?.trim() || undefined;
  const page = Math.max(1, Number(params.page ?? 1));

  const { rows, total, pageSize } = await listSubmissions({ status, query, page });
  const totalPages = Math.ceil(total / pageSize);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = { status: params.status, q: params.q, page: params.page, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    return `/admin/submissions?${p.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-xl text-foreground">Submissions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{total} total</p>
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
            const isAll = s === "";
            const isActive = isAll ? !status : status === s;
            const label = isAll ? "All" : s.charAt(0) + s.slice(1).toLowerCase();
            const href = isAll
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

      {/* Table card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        {rows.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="size-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No submissions found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Patient", "Type", "Service", "Status", "Date", ""].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={`border-l-2 hover:bg-muted/30 transition-colors ${STATUS_ROW_ACCENT[r.status]}`}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {initials(r.fullName)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{r.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground capitalize text-xs">
                    {r.type.toLowerCase()}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs max-w-35 truncate">
                    {r.service ?? "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLOR[r.status]}`}
                    >
                      {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Link
                      href={`/admin/submissions/${r.id}`}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
