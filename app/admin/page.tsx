import { getDashboardStats } from "./actions";
import Link from "next/link";
import { Inbox, TrendingUp, CalendarCheck, Archive, Users, ArrowRight } from "lucide-react";

const STATUS_CONFIG = {
  NEW: {
    label: "New",
    icon: Inbox,
    iconBg: "bg-blue-100 text-blue-600",
    accent: "border-l-blue-500",
    countColor: "text-blue-700",
  },
  CONTACTED: {
    label: "Contacted",
    icon: Users,
    iconBg: "bg-yellow-100 text-yellow-600",
    accent: "border-l-yellow-500",
    countColor: "text-yellow-700",
  },
  BOOKED: {
    label: "Booked",
    icon: CalendarCheck,
    iconBg: "bg-green-100 text-green-600",
    accent: "border-l-green-500",
    countColor: "text-green-700",
  },
  ARCHIVED: {
    label: "Archived",
    icon: Archive,
    iconBg: "bg-gray-100 text-gray-500",
    accent: "border-l-gray-400",
    countColor: "text-gray-600",
  },
} as const;

const STATUS_BADGE: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  BOOKED: "bg-green-50 text-green-700 border-green-200",
  ARCHIVED: "bg-gray-50 text-gray-600 border-gray-200",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default async function AdminDashboard() {
  const { statusCounts, recent } = await getDashboardStats();

  const totals = Object.fromEntries(
    statusCounts.map((r) => [r.status, r.count])
  ) as Record<string, number>;
  const grandTotal = statusCounts.reduce((s, r) => s + r.count, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="font-heading font-bold text-xl text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{grandTotal} total submissions</p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(["NEW", "CONTACTED", "BOOKED", "ARCHIVED"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          const count = totals[s] ?? 0;
          return (
            <Link
              key={s}
              href={`/admin/submissions?status=${s}`}
              className={`group rounded-xl border-l-4 border border-border bg-card p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${cfg.accent}`}
            >
              <div className="flex items-center justify-between">
                <div className={`size-8 rounded-lg flex items-center justify-center ${cfg.iconBg}`}>
                  <Icon className="size-4" />
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <p className={`text-2xl font-bold ${cfg.countColor}`}>{count}</p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">{cfg.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            <h2 className="font-semibold text-sm text-foreground">Recent Submissions</h2>
          </div>
          <Link
            href="/admin/submissions"
            className="text-xs text-primary hover:underline font-medium"
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Inbox className="size-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((r) => {
              const badge = STATUS_BADGE[r.status] ?? "";
              return (
                <li key={r.id}>
                  <Link
                    href={`/admin/submissions/${r.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors group"
                  >
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                      {initials(r.fullName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {r.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {r.service ?? r.email}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${badge}`}>
                      {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                      {formatDate(r.createdAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
