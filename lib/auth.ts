import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export async function requireUser() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");

  // Upsert profile on first authenticated request
  await db.insert(profiles).values({
    id: user.id,
    email: user.email!,
    fullName: user.user_metadata?.full_name ?? null,
  }).onConflictDoNothing();

  return user;
}
