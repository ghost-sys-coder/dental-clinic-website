import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Role = "ADMIN" | "EDITOR" | "VIEWER";

const HIERARCHY: Record<Role, number> = { VIEWER: 0, EDITOR: 1, ADMIN: 2 };

export async function requireUser() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");

  // Upsert profile on first authenticated request.
  // Role is seeded from invite metadata so invited editors/admins get the right role immediately.
  const inviteRole = (user.user_metadata?.role as Role | undefined);
  await db.insert(profiles).values({
    id: user.id,
    email: user.email!,
    fullName: user.user_metadata?.full_name ?? null,
    role: inviteRole ?? "VIEWER",
  }).onConflictDoNothing();

  return user;
}

export async function requireRole(min: Role) {
  const user = await requireUser();
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  const role = (profile?.role as Role) ?? "VIEWER";
  if (HIERARCHY[role] < HIERARCHY[min]) throw new Error("FORBIDDEN");
  return { user, role };
}

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
