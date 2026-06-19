import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  hasPermission,
  type Role,
  type Permission,
} from "@/lib/permissions";

export type { Role, Permission } from "@/lib/permissions";

// ── Loose hierarchy retained for legacy requireRole calls ────────────────────
// Higher = more privileged. Used only by the deprecated `requireRole(min)` API.
const LEGACY_HIERARCHY: Record<Role, number> = {
  VIEWER:             0,
  CONTENT_EDITOR:     1,
  RECEPTIONIST:       1,
  CLINICAL_ASSISTANT: 1,
  PRACTITIONER:       1,
  EDITOR:             2,
  CLINIC_MANAGER:     2,
  ADMIN:              3,
  OWNER:              4,
};

export async function requireUser() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");

  // Upsert profile on first authenticated request.
  // Role is seeded from invite metadata so invited staff get the right role immediately.
  const inviteRole = (user.user_metadata?.role as Role | undefined);
  await db.insert(profiles).values({
    id: user.id,
    email: user.email!,
    fullName: user.user_metadata?.full_name ?? null,
    role: inviteRole ?? "VIEWER",
  }).onConflictDoNothing();

  return user;
}

/**
 * Resolve the calling user's role. Hits the database on each call — prefer
 * passing the role down from a server component to avoid repeated lookups.
 */
export async function getSessionRole(): Promise<Role> {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "VIEWER";

    const [profile] = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    return (profile?.role as Role) ?? "VIEWER";
  } catch {
    return "VIEWER";
  }
}

/**
 * Permission-based gate. Throws "FORBIDDEN" if the calling user's role lacks
 * the permission. Returns the auth user + role for action handlers.
 */
export async function requirePermission(permission: Permission) {
  const user = await requireUser();
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  const role = (profile?.role as Role) ?? "VIEWER";
  if (!hasPermission(role, permission)) throw new Error("FORBIDDEN");
  return { user, role };
}

/**
 * Legacy hierarchy gate. Prefer requirePermission for new code. Kept so older
 * callers (and any external integrations) keep working during the migration.
 */
export async function requireRole(min: Role) {
  const user = await requireUser();
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  const role = (profile?.role as Role) ?? "VIEWER";
  if (LEGACY_HIERARCHY[role] < LEGACY_HIERARCHY[min]) throw new Error("FORBIDDEN");
  return { user, role };
}
