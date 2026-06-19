import { redirect } from "next/navigation";
import { listStaff } from "../actions";
import { getSessionRole, requireUser } from "@/lib/auth";
import ExportButton from "./ExportButton";
import InviteForm from "./InviteForm";
import RoleControl from "./RoleControl";
import { Users, Download, Bell, ShieldCheck, UserPlus } from "lucide-react";
import type { Role } from "@/lib/auth";
import { ROLE_LABEL, hasPermission } from "@/lib/permissions";

const ROLE_BADGE: Record<Role, string> = {
  OWNER:              "bg-rose-50 text-rose-700 border-rose-200",
  ADMIN:              "bg-primary/10 text-primary border-primary/20",
  CLINIC_MANAGER:     "bg-amber-50 text-amber-700 border-amber-200",
  PRACTITIONER:       "bg-blue-50 text-blue-700 border-blue-200",
  CLINICAL_ASSISTANT: "bg-cyan-50 text-cyan-700 border-cyan-200",
  RECEPTIONIST:       "bg-violet-50 text-violet-700 border-violet-200",
  CONTENT_EDITOR:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  EDITOR:             "bg-blue-50 text-blue-700 border-blue-200",
  VIEWER:             "bg-muted text-muted-foreground border-border",
};

export default async function SettingsPage() {
  const [user, userRole, staff] = await Promise.all([
    requireUser(),
    getSessionRole(),
    listStaff(),
  ]);

  if (!hasPermission(userRole, "settings.view")) redirect("/admin");

  const canManageStaff = hasPermission(userRole, "staff.manage_roles");
  const canInviteStaff = hasPermission(userRole, "staff.create");
  const canExport      = hasPermission(userRole, "lead.export");

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="font-heading font-bold text-xl text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Notifications, staff accounts, and data export.
        </p>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
          <div className="size-6 rounded-md bg-blue-100 flex items-center justify-center">
            <Bell className="size-3.5 text-blue-600" />
          </div>
          <h2 className="text-xs font-semibold text-foreground">Email Notifications</h2>
        </div>
        <div className="px-4 py-3 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            New submission alerts go to{" "}
            <strong className="text-foreground font-medium">
              {process.env.NOTIFY_TO ?? "the configured NOTIFY_TO address"}
            </strong>
            .
          </p>
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 border border-border px-3 py-2 mt-1">
            <ShieldCheck className="size-3.5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Email bodies contain <strong className="text-foreground">no patient data</strong>.
              Staff must log in to view submission details. To change the recipient, update the{" "}
              <code className="font-mono text-[11px] bg-muted px-1 rounded">NOTIFY_TO</code>{" "}
              environment variable and redeploy.
            </p>
          </div>
        </div>
      </div>

      {/* Staff accounts */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-purple-100 flex items-center justify-center">
              <Users className="size-3.5 text-purple-600" />
            </div>
            <h2 className="text-xs font-semibold text-foreground">Staff Accounts</h2>
          </div>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            {staff.length}
          </span>
        </div>

        {staff.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Users className="size-7 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No staff accounts yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {staff.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {(s.fullName ?? s.email).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {s.fullName ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                </div>

                {canManageStaff ? (
                  <RoleControl
                    profileId={s.id}
                    currentRole={s.role as Role}
                    actorRole={userRole}
                    isSelf={s.id === user.id}
                  />
                ) : (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_BADGE[s.role as Role] ?? ROLE_BADGE.VIEWER}`}>
                    {ROLE_LABEL[s.role as Role] ?? s.role}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Invite section */}
        {canInviteStaff && (
          <div className="px-4 py-3 border-t border-border bg-muted/20">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="size-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold text-foreground">Invite a team member</p>
            </div>
            <InviteForm actorRole={userRole} />
          </div>
        )}
      </div>

      {/* Export */}
      {canExport && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
            <div className="size-6 rounded-md bg-green-100 flex items-center justify-center">
              <Download className="size-3.5 text-green-600" />
            </div>
            <h2 className="text-xs font-semibold text-foreground">Export Data</h2>
          </div>
          <div className="px-4 py-3 flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Download all submissions as a CSV file. Export events are logged in the audit trail.
            </p>
            <ExportButton />
          </div>
        </div>
      )}
    </div>
  );
}
