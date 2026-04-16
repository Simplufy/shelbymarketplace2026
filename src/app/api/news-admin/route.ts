import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("news_articles")
    .select("*")
    .order("created_at", { ascending: false });
  
  return NextResponse.json({ data: data || [], error: error?.message });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, excerpt, content, category, image_url, status, featured, read_time, published_at, created_at, updated_at } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const sessionClient = await createClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE ||
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    const writer =
      supabaseUrl && serviceKey
        ? createAdminClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          })
        : sessionClient;

    const { data, error } = await writer
      .from("news_articles")
      .insert({
        title: title.trim(),
        excerpt: excerpt?.trim() || `${content?.slice(0, 200) || ""}...`,
        content: content?.trim() || "",
        category: category || "Market News",
        image_url: image_url || null,
        author_id: user?.id || null,
        status: status || "draft",
        featured: featured || false,
        read_time: read_time || `${Math.ceil((content || "").split(" ").length / 200)} min read`,
        published_at: published_at || null,
        created_at: created_at || new Date().toISOString(),
        updated_at: updated_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create article" }, { status: 500 });
  }
}