'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, Image as ImageIcon, Type, FileText, Save, Loader2, 
  Link as LinkIcon, Bold, Italic, List, Eye, AlertCircle, CheckCircle
} from 'lucide-react';

export default function NewArticle() {
  const router = useRouter();
  const supabase = createClient();
  
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Review' | 'Market News' | 'Guide' | 'Collectors'>('Market News');
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{id: string} | null>(null);
  const [bucketError, setBucketError] = useState<string | null>(null);
  const [creatingBucket, setCreatingBucket] = useState(false);

  useEffect(() => {
    getCurrentUser();
    checkBucket();
  }, []);

  const checkBucket = async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const hasSiteImages = buckets?.some(b => b.name === 'site-images');
      if (!hasSiteImages) {
        setBucketError('Storage bucket "site-images" not found. Click "Create Bucket" below.');
      }
    } catch (err) {
      console.error('Error checking buckets:', err);
    }
  };

  const createBucket = async () => {
    setCreatingBucket(true);
    try {
      const response = await fetch('/api/admin/setup', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setBucketError(null);
        alert('Bucket created successfully! You can now upload images.');
      } else {
        alert(data.error || 'Failed to create bucket');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setCreatingBucket(false);
  };

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setBucketError(null);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `article-${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase
        .storage
        .from('site-images')
        .upload(fileName, file);

      if (uploadError) {
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('does not exist')) {
          setBucketError('Storage bucket "site-images" not found. Click "Create Bucket" below.');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('site-images')
        .getPublicUrl(fileName);

      setFeaturedImage(publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      if (!error.message?.includes('not found')) {
        alert(`Failed to upload image: ${error.message}`);
      }
    }
    setUploading(false);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const linkText = prompt('Enter link text (optional - leave blank to use URL):') || url;
      const linkMarkdown = `[${linkText}](${url})`;
      setContent(prev => prev + linkMarkdown);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!user) {
      alert('You must be logged in to create an article');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .insert({
          title: title.trim(),
          excerpt: excerpt.trim() || content.slice(0, 200) + '...',
          content: content.trim(),
          category,
          image_url: featuredImage,
          author_id: user.id,
          status,
          featured: false,
          read_time: `${Math.ceil(content.split(' ').length / 200)} min read`,
          published_at: status === 'published' ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      alert(`Article ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
      router.push('/admin/news');
    } catch (error: any) {
      console.error('Error saving article:', error);
      alert(`Failed to save article: ${error.message}`);
    }
    setSaving(false);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/news"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-3xl font-outfit font-black text-gray-900">Create Article</h1>
            <p className="text-gray-500">Write and publish a new article for your audience.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="px-6 py-3 bg-[#E31837] text-white font-bold rounded-xl hover:bg-[#c41530] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Type className="w-4 h-4" />
              Article Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a compelling headline..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all text-lg font-bold"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Excerpt / Summary
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the article (optional - will auto-generate from content if left blank)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all resize-none"
            />
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Content
            </label>
            
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-3">
              <button
                type="button"
                onClick={() => setContent(prev => prev + '**bold text**')}
                className="p-2 hover:bg-gray-200 rounded font-bold"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setContent(prev => prev + '*italic text*')}
                className="p-2 hover:bg-gray-200 rounded italic"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setContent(prev => prev + '\n- List item\n- List item\n- List item')}
                className="p-2 hover:bg-gray-200 rounded"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button
                type="button"
                onClick={insertLink}
                className="p-2 hover:bg-gray-200 rounded flex items-center gap-1 text-[#002D72]"
                title="Insert Link"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="text-sm">Add Link</span>
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content here...\n\nUse markdown formatting:\n**bold** for bold text\n*italic* for italic text\n[link text](https://example.com) for links"
              rows={15}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Supports Markdown: **bold**, *italic*, [links](url), - lists
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
            >
              <option value="Market News">Market News</option>
              <option value="Review">Review</option>
              <option value="Guide">Guide</option>
              <option value="Collectors">Collectors</option>
            </select>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Featured Image
            </label>
            
            {/* Bucket Error */}
            {bucketError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{bucketError}</p>
                    <button
                      onClick={createBucket}
                      disabled={creatingBucket}
                      className="mt-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {creatingBucket ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {creatingBucket ? 'Creating...' : 'Create Bucket'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {featuredImage ? (
              <div className="relative">
                <img 
                  src={featuredImage} 
                  alt="Featured" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setFeaturedImage(null)}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                bucketError ? 'border-red-300 bg-red-50 hover:border-red-400' : 'border-gray-300 hover:border-[#002D72] hover:bg-blue-50'
              }`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className={`w-10 h-10 mb-3 ${bucketError ? 'text-red-400' : 'text-gray-400'}`} />
                  <p className={`text-sm ${bucketError ? 'text-red-600' : 'text-gray-500'}`}>
                    {bucketError ? 'Fix storage bucket first' : 'Click to upload featured image'}
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading || !!bucketError}
                  className="hidden"
                />
              </label>
            )}
            {uploading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Word count:</span>
                <span className="font-medium">{content.split(' ').filter(w => w).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Est. read time:</span>
                <span className="font-medium">{Math.ceil(content.split(' ').filter(w => w).length / 200)} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Has image:</span>
                <span className="font-medium">{featuredImage ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
