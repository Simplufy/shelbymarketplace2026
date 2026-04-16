import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  const reader =
    supabaseUrl && serviceKey
      ? createAdminClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : supabase;

  let article: any = null;

  const bySlug = await reader
    .from("news_articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!bySlug.error && bySlug.data) {
    article = bySlug.data;
  } else {
    const byId = await reader
      .from("news_articles")
      .select("*")
      .eq("id", slug)
      .single();

    if (!byId.error && byId.data) {
      article = byId.data;
    }
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <h1 className="text-3xl font-black mb-3">Article not found</h1>
          <p className="text-[#565d6d] mb-8">This article may have been removed or is not published yet.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 px-5 py-3 bg-[#002D72] text-white font-bold rounded-lg">
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  const contentBlocks = String(article.content || "")
    .split("\n")
    .map((block) => block.trim())
    .filter(Boolean);

  const { data: relatedRows } = await reader
    .from("news_articles")
    .select("id, slug, title, image_url, published_at, created_at")
    .eq("status", "published")
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(8);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article className="lg:col-span-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-[#002D72] mb-8 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </Link>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-[#E31837]/10 text-[#E31837] text-[11px] font-black uppercase rounded-full tracking-wider">
              {article.category || "News"}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#565d6d]">
              {new Date(article.published_at || article.created_at).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#565d6d]">
              <Clock className="w-3 h-3" />
              {article.read_time || "5 min read"}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4 break-words">{article.title}</h1>
          {article.excerpt ? <p className="text-lg text-[#565d6d] leading-relaxed mb-8">{article.excerpt}</p> : null}

          <div className="relative w-full h-[280px] md:h-[460px] rounded-2xl overflow-hidden mb-10 border border-[#dee1e6]">
            <img src={article.image_url || "/images/logo.png"} alt={article.title} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-lg max-w-none prose-p:text-[#202631] prose-p:leading-8">
            {contentBlocks.length > 0 ? (
              contentBlocks.map((block, idx) => (
                <p key={idx} className="mb-6 whitespace-pre-wrap">
                  {block}
                </p>
              ))
            ) : (
              <p className="text-[#565d6d]">No article body available.</p>
            )}
          </div>
        </article>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <h2 className="text-lg font-black tracking-tight mb-5">Other articles you may like</h2>
            <div className="space-y-4">
              {(relatedRows || []).map((item: any) => (
                <Link key={item.id} href={`/blog/${item.slug || item.id}`} className="flex gap-3 p-3 border border-[#dee1e6] rounded-xl hover:border-[#002D72]/30 transition-colors">
                  <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0">
                    <img src={item.image_url || "/images/logo.png"} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-[#565d6d] mb-1">{new Date(item.published_at || item.created_at).toLocaleDateString()}</p>
                    <h3 className="text-sm font-bold leading-snug line-clamp-3">{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
