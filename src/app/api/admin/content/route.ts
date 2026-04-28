import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAllowlistedAdminEmail } from "@/lib/admin/allowlist";

type ContentSection = {
  key: "hero" | "featured_listings" | "why_sell" | "why_buy" | "cta";
  value: unknown;
};

const mirrorSettingKey = (key: ContentSection["key"]) => `homepage_${key}`;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "ADMIN" && !isAllowlistedAdminEmail(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const sections = (body.sections || []) as ContentSection[];

    if (!Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json({ error: "No sections to save" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE;

    // Prefer service-role writes when configured, fallback to session client
    // so saves can still work in environments where service key is missing.
    const writer =
      supabaseUrl && serviceKey
        ? createAdminClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : supabase;

    for (const section of sections) {
      const { data: existingRows, error: selectError } = await writer
        .from("site_content")
        .select("id")
        .eq("section", "homepage")
        .eq("key", section.key);

      if (selectError) throw selectError;

      if (existingRows && existingRows.length > 0) {
        const { error: updateError } = await writer
          .from("site_content")
          .update({
            value: section.value,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq("section", "homepage")
          .eq("key", section.key);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await writer
          .from("site_content")
          .insert({
            section: "homepage",
            key: section.key,
            value: section.value,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          });

        if (insertError) throw insertError;
      }

      const mirrorKey = mirrorSettingKey(section.key);
      const { data: existingSettingRows, error: settingSelectError } = await writer
        .from("site_settings")
        .select("id")
        .eq("key", mirrorKey);

      if (settingSelectError) throw settingSelectError;

      if (existingSettingRows && existingSettingRows.length > 0) {
        const { error: settingUpdateError } = await writer
          .from("site_settings")
          .update({
            value: section.value,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq("key", mirrorKey);

        if (settingUpdateError) throw settingUpdateError;
      } else {
        const { error: settingInsertError } = await writer
          .from("site_settings")
          .insert({
            key: mirrorKey,
            value: section.value,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          });

        if (settingInsertError) throw settingInsertError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin content save failed:", error);

    const message =
      error?.message ||
      "Failed to save content. If this is production, add SUPABASE_SERVICE_ROLE_KEY in Vercel or enable update/insert RLS policies for site_content.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
