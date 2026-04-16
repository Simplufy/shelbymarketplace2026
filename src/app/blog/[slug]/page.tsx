import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

function parseMarkdownLine(line: string, key: number) {
  const trimmed = line.trim();

  if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
    const text = trimmed.slice(2);
    return (
      <li key={key} className="mb-2 ml-4 list-disc">
        {parseInlineMarkdown(text)}
      </li>
    );
  }

  if (trimmed.startsWith("### ")) {
    return (
      <h3 key={key} className="text-xl font-bold mt-6 mb-3">
        {parseInlineMarkdown(trimmed.slice(4))}
      </h3>
    );
  }

  if (trimmed.startsWith("## ")) {
    return (
      <h2 key={key} className="text-2xl font-bold mt-8 mb-4">
        {parseInlineMarkdown(trimmed.slice(3))}
      </h2>
    );
  }

  if (trimmed.startsWith("# ")) {
    return (
      <h1 key={key} className="text-3xl font-black mt-8 mb-4">
        {parseInlineMarkdown(trimmed.slice(2))}
      </h1>
    );
  }

  return (
    <p key={key} className="mb-6">
      {parseInlineMarkdown(trimmed)}
    </p>
  );
}

function parseInlineMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);

    type Match = { type: string; index: number; length: number; content: string; extra?: string };
    let firstMatch: Match | null = null;

    if (boldMatch) {
      firstMatch = { type: "bold", index: boldMatch.index!, length: boldMatch[0].length, content: boldMatch[1] };
    }
    if (italicMatch && (!firstMatch || italicMatch.index! < firstMatch.index)) {
      firstMatch = { type: "italic", index: italicMatch.index!, length: italicMatch[0].length, content: italicMatch[1] };
    }
    if (linkMatch && (!firstMatch || linkMatch.index! < firstMatch.index)) {
      firstMatch = { type: "link", index: linkMatch.index!, length: linkMatch[0].length, content: linkMatch[1], extra: linkMatch[2] };
    }

    if (!firstMatch) {
      parts.push(remaining);
      break;
    }

    if (firstMatch.index > 0) {
      parts.push(remaining.slice(0, firstMatch.index));
    }

    if (firstMatch.type === "bold") {
      parts.push(<strong key={key++}>{firstMatch.content}</strong>);
    } else if (firstMatch.type === "italic") {
      parts.push(<em key={key++}>{firstMatch.content}</em>);
    } else if (firstMatch.type === "link") {
      parts.push(
        <a key={key++} href={firstMatch.extra} target="_blank" rel="noopener noreferrer" className="text-[#002D72] underline">
          {firstMatch.content}
        </a>
      );
    }

    remaining = remaining.slice(firstMatch.index + firstMatch.length);
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
}

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

  const contentLines = String(article.content || "").split("\n");

  const renderedContent: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let listKey = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      renderedContent.push(
        <ul key={`list-${listKey++}`} className="list-disc ml-6 mb-6 space-y-2">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  contentLines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      const text = trimmed.slice(2);
      listItems.push(
        <li key={`item-${idx}`} className="ml-2">
          {parseInlineMarkdown(text)}
        </li>
      );
    } else {
      flushList();
      renderedContent.push(parseMarkdownLine(line, idx));
    }
  });
  flushList();

  const { data: allPublished, error: relatedError } = await reader
    .from("news_articles")
    .select("id, slug, title, image_url, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(20);

  const relatedRows = (allPublished || []).filter((a: any) => a.id !== article.id).slice(0, 8);

  console.log("Related articles debug:", { 
    allCount: allPublished?.length, 
    relatedCount: relatedRows.length, 
    error: relatedError?.message,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY 
  });

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
            {renderedContent.length > 0 ? (
              renderedContent
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
