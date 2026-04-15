import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const keysParam = req.nextUrl.searchParams.get("keys") || "";
    const keys = keysParam
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    if (keys.length === 0) {
      return NextResponse.json({ data: {} }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
    }

    const { data, error } = await supabase.from("site_settings").select("key, value").in("key", keys);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped: Record<string, unknown> = {};
    for (const item of data || []) {
      mapped[item.key] = item.value;
    }

    return NextResponse.json(
      { data: mapped },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load settings" }, { status: 500 });
  }
}
