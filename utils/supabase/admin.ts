import { createClient } from "@supabase/supabase-js";

// Service-role client — never expose to the browser.
// Used only in server actions that require admin-level Supabase operations (e.g. inviteUserByEmail).
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);
