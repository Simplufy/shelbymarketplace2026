import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

type Article = {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  read_time: string | null;
  published_at: string | null;
  created_at: string;
  featured: boolean;
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
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

  const { data } = await reader
    .from("news_articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const articles = (data || []) as Article[];

  const sorted = [...articles].sort((a, b) => {
    const aTime = new Date(a.published_at || a.created_at).getTime();
    const bTime = new Date(b.published_at || b.created_at).getTime();
    return bTime - aTime;
  });

  const featuredArticle =
    [...sorted].filter((a) => a.featured).sort((a, b) => {
      const aTime = new Date(a.published_at || a.created_at).getTime();
      const bTime = new Date(b.published_at || b.created_at).getTime();
      return bTime - aTime;
    })[0] || sorted[0] || null;

  const gridArticles = sorted.filter((a) => a.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-12">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-black tracking-tighter mb-4 break-words">News &amp; Reviews</h1>
          <p className="text-lg text-[#565d6d] max-w-2xl">The latest in Shelby history, auction news, performance guides, and engineering deep-dives from the Ford Shelby Exchange editorial team.</p>
        </div>

        {featuredArticle ? (
          <Link href={`/news/${featuredArticle.slug || featuredArticle.id}`} className="relative rounded-3xl overflow-hidden mb-16 group cursor-pointer block">
            <div className="aspect-[21/9] md:aspect-[3/1]">
              <img src={featuredArticle.image_url || "/images/logo.png"} alt={featuredArticle.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute top-6 left-6">
              <span className="px-4 py-1.5 bg-[#E31837] text-white text-[10px] font-black rounded-full uppercase tracking-wider">Featured</span>
            </div>
            <div className="absolute bottom-8 left-8 right-8 md:max-w-2xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black text-[#E31837] uppercase tracking-widest">{featuredArticle.category}</span>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{new Date(featuredArticle.published_at || featuredArticle.created_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-white/60"><Clock className="w-3 h-3" /> {featuredArticle.read_time || "5 min"} read</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-outfit font-black text-white leading-tight mb-3 break-words">{featuredArticle.title}</h2>
              <p className="text-white/70 text-sm md:text-base mb-4 line-clamp-2">{featuredArticle.excerpt}</p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[#E31837] transition-colors">
                Read Full Story <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gridArticles.map((article) => (
            <Link href={`/news/${article.slug || article.id}`} key={article.id} className="bg-white rounded-2xl border border-[#dee1e6] overflow-hidden card-shadow group cursor-pointer block">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={article.image_url || "/images/logo.png"} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[9px] font-black text-[#E31837] uppercase tracking-widest">{article.category}</span>
                  <span className="text-[9px] font-bold text-[#565d6d] uppercase tracking-widest">{new Date(article.published_at || article.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-outfit font-bold leading-snug mb-3 group-hover:text-[#002D72] transition-colors line-clamp-2">{article.title}</h3>
                <p className="text-sm text-[#565d6d] leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#565d6d]"><Clock className="w-3 h-3" /> {article.read_time || "5 min"} read</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-[#002D72] group-hover:underline">Read More <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold mb-2">No published articles yet</h3>
            <p className="text-[#565d6d]">Publish articles from Admin → News to show them here.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
