'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  Image as ImageIcon,
  Save,
  Loader2,
  Link as LinkIcon,
  Bold,
  Italic,
  List,
  Eye,
} from 'lucide-react';

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const articleId = params.id as string;
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Review' | 'Market News' | 'Guide' | 'Collectors'>('Market News');
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;

      setTitle(data.title || '');
      setExcerpt(data.excerpt || '');
      setContent(data.content || '');
      setCategory((data.category as any) || 'Market News');
      setFeaturedImage(data.image_url || null);
    } catch (error: any) {
      console.error('Error loading article:', error);
      alert(`Failed to load article: ${error.message}`);
      router.push('/admin/news');
    }
    setLoading(false);
  };

  const wrapSelection = (before: string, after: string, placeholder: string) => {
    const textarea = contentRef.current;
    if (!textarea) {
      setContent(prev => prev + before + placeholder + after);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToWrap = selectedText || placeholder;
    const newValue = content.substring(0, start) + before + textToWrap + after + content.substring(end);
    setContent(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = start + before.length;
      const cursorEnd = cursorStart + textToWrap.length;
      textarea.setSelectionRange(selectedText ? cursorEnd : cursorStart, selectedText ? cursorEnd : cursorEnd);
    });
  };

  const insertAtCursor = (text: string) => {
    const textarea = contentRef.current;
    if (!textarea) {
      setContent(prev => prev + text);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = content.substring(0, start) + text + content.substring(end);
    setContent(newValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const newPos = start + text.length;
      textarea.setSelectionRange(newPos, newPos);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pathname', `news/${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split('.').pop()}`);

      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFeaturedImage(data.url);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error.message}`);
    }
    setUploading(false);
  };

  const insertLink = () => {
    const textarea = contentRef.current;
    const selectedText = textarea ? content.substring(textarea.selectionStart, textarea.selectionEnd) : '';

    const url = prompt('Enter URL:');
    if (!url) return;

    const linkText = selectedText || prompt('Enter link text (optional):') || url;
    insertAtCursor(`[${linkText}](${url})`);
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('news_articles')
        .update({
          title: title.trim(),
          excerpt: excerpt.trim() || `${content.slice(0, 200)}...`,
          content: content.trim(),
          category,
          image_url: featuredImage,
          status,
          read_time: `${Math.ceil(content.split(' ').length / 200)} min read`,
          published_at: status === 'published' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', articleId);

      if (error) throw error;

      alert('Article updated successfully!');
      router.push('/admin/news');
    } catch (error: any) {
      console.error('Error updating article:', error);
      alert(`Failed to update article: ${error.message}`);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#002D72]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin/news" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#002D72] mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to News
          </Link>
          <h1 className="text-3xl font-outfit font-black text-gray-900">Edit Article</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Article Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none resize-none"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-gray-700">Content (Markdown)</label>
                <div className="flex gap-2">
                  <button onClick={() => wrapSelection('**', '**', 'bold text')} className="p-2 hover:bg-gray-100 rounded"><Bold className="w-4 h-4" /></button>
                  <button onClick={() => wrapSelection('*', '*', 'italic text')} className="p-2 hover:bg-gray-100 rounded"><Italic className="w-4 h-4" /></button>
                  <button onClick={() => insertAtCursor('\n- List item')} className="p-2 hover:bg-gray-100 rounded"><List className="w-4 h-4" /></button>
                  <button onClick={insertLink} className="p-2 hover:bg-gray-100 rounded"><LinkIcon className="w-4 h-4" /></button>
                </div>
              </div>
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none"
              >
                <option value="Review">Review</option>
                <option value="Market News">Market News</option>
                <option value="Guide">Guide</option>
                <option value="Collectors">Collectors</option>
              </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Featured Image
              </label>
              {featuredImage ? (
                <img src={featuredImage} alt="Featured" className="w-full h-40 object-cover rounded-lg mb-3" />
              ) : null}
              <label className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadIcon />}
                <span className="text-sm">{uploading ? 'Uploading...' : 'Upload Image'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
              </label>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="w-full px-4 py-3 bg-[#002D72] text-white font-bold rounded-lg hover:bg-[#001D4A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Publish Changes
              </button>
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadIcon() {
  return <ImageIcon className="w-4 h-4" />;
}
