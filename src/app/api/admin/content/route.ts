import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

type ContentSection = {
  key: "hero" | "featured_listings" | "why_sell" | "cta";
  value: unknown;
};

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

    if (profile?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const sections = (body.sections || []) as ContentSection[];

    if (!Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json({ error: "No sections to save" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
    }

    const admin = createAdminClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    for (const section of sections) {
      const { data: existingRows, error: selectError } = await admin
        .from("site_content")
        .select("id")
        .eq("section", "homepage")
        .eq("key", section.key);

      if (selectError) throw selectError;

      if (existingRows && existingRows.length > 0) {
        const { error: updateError } = await admin
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
        const { error: insertError } = await admin
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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin content save failed:", error);
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 });
  }
}
