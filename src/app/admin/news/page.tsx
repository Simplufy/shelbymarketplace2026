"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, Edit2, Trash2, Eye, Calendar, Clock, Star,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { NewsArticle } from "@/lib/supabase/database.types";

export default function NewsManager() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news-admin');
      const result = await res.json();
      
      if (result.error) {
        console.error("API error:", result.error);
      }
      setArticles(result.data || []);
    } catch (error) {
      console.error("Error loading articles:", error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const { error } = await supabase
        .from("news_articles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await loadArticles();
      setSelectedArticles(prev => prev.filter(aid => aid !== id));
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Failed to delete article");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedArticles.length} articles?`)) return;

    try {
      const { error } = await supabase
        .from("news_articles")
        .delete()
        .in("id", selectedArticles);

      if (error) throw error;
      await loadArticles();
      setSelectedArticles([]);
    } catch (error) {
      console.error("Error deleting articles:", error);
      alert("Failed to delete articles");
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const updateData: { status: string; published_at?: string | null } = { 
        status: newStatus 
      };
      
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("news_articles")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
      await loadArticles();
    } catch (error) {
      console.error("Error updating article:", error);
      alert("Failed to update article");
    }
  };

  const handleSetFeatured = async (id: string) => {
    try {
      await supabase
        .from("news_articles")
        .update({ featured: false })
        .eq("featured", true);

      const { error } = await supabase
        .from("news_articles")
        .update({ featured: true })
        .eq("id", id);

      if (error) throw error;
      await loadArticles();
    } catch (error) {
      console.error("Error setting featured article:", error);
      alert("Failed to set featured article");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedArticles(prev => 
      prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(filteredArticles.map(a => a.id));
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || article.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-700";
      case "draft": return "bg-yellow-100 text-yellow-700";
      case "archived": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Review": return "bg-[#002D72] text-white";
      case "Market News": return "bg-blue-100 text-blue-700";
      case "Guide": return "bg-[#E31837] text-white";
      case "Collectors": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not published";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#002D72]" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-outfit font-black text-gray-900 mb-2">News & Articles</h1>
          <p className="text-gray-500">Create and manage editorial content for your audience.</p>
        </div>
        <Link
          href="/admin/news/new"
          className="flex items-center gap-2 px-6 py-3 bg-[#E31837] text-white font-bold rounded-xl hover:bg-[#c41530] transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Article
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Articles", value: articles.length, color: "blue" },
          { label: "Published", value: articles.filter(a => a.status === "published").length, color: "green" },
          { label: "Drafts", value: articles.filter(a => a.status === "draft").length, color: "yellow" },
          { label: "Featured", value: articles.filter(a => a.featured).length, color: "red" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-gray-200">
            <div className={`text-2xl font-black ${
              stat.color === "blue" ? "text-[#002D72]" :
              stat.color === "green" ? "text-green-600" :
              stat.color === "yellow" ? "text-yellow-600" :
              "text-[#E31837]"
            }`}>{stat.value}</div>
            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none text-sm bg-white"
          >
            <option value="all">All Categories</option>
            <option value="Review">Review</option>
            <option value="Market News">Market News</option>
            <option value="Guide">Guide</option>
            <option value="Collectors">Collectors</option>
          </select>
        </div>

        {selectedArticles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{selectedArticles.length} selected</span>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors text-sm"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#002D72] focus:ring-[#002D72]"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Article</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Category</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Published</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Views</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredArticles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedArticles.includes(article.id)}
                    onChange={() => toggleSelection(article.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#002D72] focus:ring-[#002D72]"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img src={article.image_url || "/images/logo.png"} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{article.title}</h3>
                        {article.featured && (
                          <span className="px-2 py-0.5 bg-[#E31837] text-white text-[10px] font-bold rounded-full">
                            FEATURED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{article.excerpt}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-400">by {article.author_id || "Unknown"}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.read_time || "5 min"}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={article.status}
                    onChange={(e) => handleStatusChange(article.id, e.target.value as any)}
                    className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(article.status)}`}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(article.published_at)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">{(article.views || 0).toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/blog/${article.id}`}
                      className="p-2 text-gray-400 hover:text-[#002D72] hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/news/edit/${article.id}`}
                      className="p-2 text-gray-400 hover:text-[#002D72] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleSetFeatured(article.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        article.featured
                          ? "text-[#E31837] bg-red-50"
                          : "text-gray-400 hover:text-[#E31837] hover:bg-red-50"
                      }`}
                      title={article.featured ? "Featured article" : "Set as featured"}
                    >
                      <Star className={`w-4 h-4 ${article.featured ? "fill-current" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredArticles.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or create a new article.</p>
            <Link
              href="/admin/news/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#002D72] text-white font-bold rounded-xl hover:bg-[#001D4A] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Article
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
