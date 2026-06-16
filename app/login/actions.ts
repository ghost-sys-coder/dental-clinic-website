"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createClient(await cookies());
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return redirect("/login?error=Invalid+email+or+password");
  }

  return redirect("/admin");
}

export async function signOut() {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  return redirect("/login");
}
