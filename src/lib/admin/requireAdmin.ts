import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAllowlistedAdminEmail } from "@/lib/admin/allowlist";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const allowlisted = isAllowlistedAdminEmail(user.email);
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((error && !allowlisted) || (profile?.role !== "ADMIN" && !allowlisted)) {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true as const, supabase, user };
}
