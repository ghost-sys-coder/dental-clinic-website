// ─────────────────────────────────────────────────────────────────────────────
// Centralized role + permission map
//
// The application uses a permission-based access control system. Roles describe
// job responsibility — they are user-facing labels. Permissions control access
// — they are how the app actually gates server actions and UI.
//
// To add a new role: add it to `Role`, add an entry to ROLE_PERMISSIONS, and
// add a label to ROLE_LABEL.
//
// To gate a new server action: pick (or add) a Permission key, then call
// `requirePermission("foo.bar")` from `lib/auth`.
// ─────────────────────────────────────────────────────────────────────────────

export type Role =
  | "OWNER"
  | "ADMIN"
  | "CLINIC_MANAGER"
  | "PRACTITIONER"
  | "CLINICAL_ASSISTANT"
  | "RECEPTIONIST"
  | "CONTENT_EDITOR"
  | "VIEWER"
  | "EDITOR"; // legacy — treated as CLINIC_MANAGER

export type Permission =
  // ── Leads (submissions) ────────────────────────────────────────────────────
  | "lead.view_all"
  | "lead.view_assigned"
  | "lead.create"
  | "lead.update"
  | "lead.assign"
  | "lead.archive"
  | "lead.export"
  // ── Appointments ──────────────────────────────────────────────────────────
  | "appointment.view_all"
  | "appointment.view_assigned"
  | "appointment.create"
  | "appointment.update"
  | "appointment.confirm"
  | "appointment.cancel"
  | "appointment.reschedule"
  | "appointment.check_in"
  | "appointment.mark_no_show"
  | "appointment.complete"
  | "appointment.update_assigned_progress"
  | "appointment.manage_availability"
  // ── Patients ──────────────────────────────────────────────────────────────
  | "patient.view_all"
  | "patient.view_assigned"
  | "patient.create"
  | "patient.update_basic"
  | "patient.update_sensitive"
  | "patient.archive"
  | "patient.export"
  // ── Clinical notes ────────────────────────────────────────────────────────
  | "clinical_note.view"
  | "clinical_note.create"
  | "clinical_note.update_own"
  | "clinical_note.update_all"
  | "clinical_note.delete"
  // ── Administrative notes (non-clinical) ───────────────────────────────────
  | "note.view"
  | "note.create"
  // ── Staff ─────────────────────────────────────────────────────────────────
  | "staff.view"
  | "staff.create"
  | "staff.update"
  | "staff.archive"
  | "staff.manage_roles"
  // ── Content (services, team profiles, website) ────────────────────────────
  | "content.view"
  | "content.create"
  | "content.update"
  | "content.publish"
  | "content.archive"
  // ── Settings ──────────────────────────────────────────────────────────────
  | "settings.view"
  | "settings.update_clinic"
  | "settings.update_branding"
  | "settings.update_notifications"
  | "settings.update_security"
  | "settings.update_billing"
  // ── Analytics ─────────────────────────────────────────────────────────────
  | "analytics.view_basic"
  | "analytics.view_full"
  | "analytics.export"
  // ── Audit logs ────────────────────────────────────────────────────────────
  | "audit.view"
  | "audit.export";

// ── Role descriptions (UI) ───────────────────────────────────────────────────

export const ROLE_LABEL: Record<Role, string> = {
  OWNER:              "Owner",
  ADMIN:              "Admin",
  CLINIC_MANAGER:     "Clinic Manager",
  PRACTITIONER:       "Practitioner",
  CLINICAL_ASSISTANT: "Clinical Assistant",
  RECEPTIONIST:       "Receptionist",
  CONTENT_EDITOR:     "Content Editor",
  VIEWER:             "Viewer",
  EDITOR:             "Editor (legacy)",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  OWNER:              "Full control. Account ownership, billing, hard deletes.",
  ADMIN:              "Senior admin. Manages everything except ownership and billing.",
  CLINIC_MANAGER:     "Daily clinic operations. Leads, appointments, patients, staff (read).",
  PRACTITIONER:       "Clinician. Sees assigned patients, writes clinical notes.",
  CLINICAL_ASSISTANT: "Supports clinicians. Sees assigned schedule, writes support notes.",
  RECEPTIONIST:       "Front desk. Bookings, check-ins, basic patient details.",
  CONTENT_EDITOR:     "Website only. Services, team profiles, marketing content.",
  VIEWER:             "Read-only. Selected dashboards and lists.",
  EDITOR:             "Legacy role — behaves like Clinic Manager.",
};

// ── Permission sets ──────────────────────────────────────────────────────────

const OPERATIONAL: Permission[] = [
  "lead.view_all", "lead.create", "lead.update", "lead.assign", "lead.archive", "lead.export",
  "appointment.view_all", "appointment.create", "appointment.update",
  "appointment.confirm", "appointment.cancel", "appointment.reschedule",
  "appointment.check_in", "appointment.mark_no_show", "appointment.complete",
  "appointment.manage_availability",
  "patient.view_all", "patient.create", "patient.update_basic", "patient.archive",
  "note.view", "note.create",
  "clinical_note.view",
  "staff.view",
  "analytics.view_basic",
  "audit.view",
];

const CONTENT: Permission[] = [
  "content.view", "content.create", "content.update", "content.publish", "content.archive",
];

const SETTINGS_NON_BILLING: Permission[] = [
  "settings.view",
  "settings.update_clinic", "settings.update_branding",
  "settings.update_notifications", "settings.update_security",
];

// ── Per-role permission lists ────────────────────────────────────────────────

const OWNER_PERMS: Permission[] = [
  ...OPERATIONAL,
  ...CONTENT,
  ...SETTINGS_NON_BILLING,
  "settings.update_billing",
  "patient.update_sensitive", "patient.export",
  "clinical_note.create", "clinical_note.update_own", "clinical_note.update_all", "clinical_note.delete",
  "staff.create", "staff.update", "staff.archive", "staff.manage_roles",
  "analytics.view_full", "analytics.export",
  "audit.view", "audit.export",
];

const ADMIN_PERMS: Permission[] = [
  ...OPERATIONAL,
  ...CONTENT,
  ...SETTINGS_NON_BILLING,
  "patient.update_sensitive", "patient.export",
  "clinical_note.update_all",
  "staff.create", "staff.update", "staff.archive", "staff.manage_roles",
  "analytics.view_full", "analytics.export",
  "audit.view", "audit.export",
];

const CLINIC_MANAGER_PERMS: Permission[] = [
  ...OPERATIONAL,
  "settings.view",
  "content.view",
];

const PRACTITIONER_PERMS: Permission[] = [
  "lead.view_assigned",
  "appointment.view_assigned", "appointment.update_assigned_progress",
  "appointment.complete", "appointment.mark_no_show",
  "patient.view_assigned",
  "note.view", "note.create",
  "clinical_note.view", "clinical_note.create", "clinical_note.update_own",
];

const CLINICAL_ASSISTANT_PERMS: Permission[] = [
  "appointment.view_assigned", "appointment.update_assigned_progress",
  "patient.view_assigned",
  "note.view", "note.create",
  "clinical_note.view", "clinical_note.create", "clinical_note.update_own",
];

const RECEPTIONIST_PERMS: Permission[] = [
  "lead.view_all", "lead.create", "lead.update",
  "appointment.view_all", "appointment.create", "appointment.update",
  "appointment.confirm", "appointment.cancel", "appointment.reschedule",
  "appointment.check_in", "appointment.mark_no_show",
  "patient.view_all", "patient.create", "patient.update_basic",
  "note.view", "note.create",
];

const CONTENT_EDITOR_PERMS: Permission[] = [
  ...CONTENT,
];

const VIEWER_PERMS: Permission[] = [
  "lead.view_all",
  "appointment.view_all",
  "patient.view_all",
  "note.view",
  "clinical_note.view",
  "staff.view",
  "content.view",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER:              OWNER_PERMS,
  ADMIN:              ADMIN_PERMS,
  CLINIC_MANAGER:     CLINIC_MANAGER_PERMS,
  PRACTITIONER:       PRACTITIONER_PERMS,
  CLINICAL_ASSISTANT: CLINICAL_ASSISTANT_PERMS,
  RECEPTIONIST:       RECEPTIONIST_PERMS,
  CONTENT_EDITOR:     CONTENT_EDITOR_PERMS,
  VIEWER:             VIEWER_PERMS,
  EDITOR:             CLINIC_MANAGER_PERMS, // legacy alias
};

// ── Helpers ──────────────────────────────────────────────────────────────────

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  const set = ROLE_PERMISSIONS[role] ?? [];
  return permissions.some((p) => set.includes(p));
}

/** Roles that can be assigned to other users via the invite/role-change UI. */
export const ASSIGNABLE_ROLES: Role[] = [
  "OWNER",
  "ADMIN",
  "CLINIC_MANAGER",
  "PRACTITIONER",
  "CLINICAL_ASSISTANT",
  "RECEPTIONIST",
  "CONTENT_EDITOR",
  "VIEWER",
];

/** Returns true if `actorRole` may assign `targetRole` to another user. */
export function canAssignRole(actorRole: Role, targetRole: Role): boolean {
  // Only the Owner may grant or revoke the Owner role.
  if (targetRole === "OWNER") return actorRole === "OWNER";
  // Admins can manage any other role.
  return actorRole === "OWNER" || actorRole === "ADMIN";
}
