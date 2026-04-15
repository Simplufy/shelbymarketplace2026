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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
        <div className="max-w-[960px] mx-auto px-4 md:px-8">
          <h1 className="text-3xl font-black mb-3">Article not found</h1>
          <p className="text-[#565d6d] mb-8">This article may have been removed or is not published yet.</p>
          <Link href="/news" className="inline-flex items-center gap-2 px-5 py-3 bg-[#002D72] text-white font-bold rounded-lg">
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  const contentBlocks = String(article.content || "")
    .split("\n")
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-[960px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <Link href="/news" className="inline-flex items-center gap-2 text-sm font-bold text-[#002D72] mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to News
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
    </div>
  );
}
