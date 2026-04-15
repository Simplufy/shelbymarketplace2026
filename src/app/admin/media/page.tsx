"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Upload, Image as ImageIcon, Search, Trash2, Copy, Check, 
  Grid, List, X, Folder, Eye, Loader2, AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  created_at: string;
  type: string;
  path: string;
}

export default function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState("listings");
  const [buckets, setBuckets] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Get available buckets
  const fetchBuckets = useCallback(async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      setBuckets(data?.map(b => b.name) || []);
    } catch (err) {
      console.error("Error fetching buckets:", err);
    }
  }, [supabase]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // List files from the current bucket/folder
      const { data, error } = await supabase
        .storage
        .from(currentFolder)
        .list("", {
          limit: 100,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" }
        });

      if (error) {
        // If bucket doesn't exist or is empty, show empty state
        if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
          setFiles([]);
          setError(`Bucket "${currentFolder}" not found. Please create it in Supabase Storage.`);
        } else {
          throw error;
        }
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        // Filter out folders (they don't have metadata)
        const fileItems = data.filter(item => 
          item.metadata && item.metadata.mimetype && 
          (item.metadata.mimetype.startsWith('image/') || item.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))
        );

        const mediaFiles: MediaFile[] = fileItems.map((item) => {
          const { data: { publicUrl } } = supabase
            .storage
            .from(currentFolder)
            .getPublicUrl(item.name);

          return {
            id: item.id || item.name,
            name: item.name,
            url: publicUrl,
            size: item.metadata?.size || 0,
            created_at: item.created_at || new Date().toISOString(),
            type: item.metadata?.mimetype || "image/jpeg",
            path: `${currentFolder}/${item.name}`
          };
        });
        setFiles(mediaFiles);
      } else {
        setFiles([]);
      }
    } catch (error: any) {
      console.error("Error fetching files:", error);
      setError(error.message || "Failed to load files");
      setFiles([]);
    }
    setLoading(false);
  }, [supabase, currentFolder]);

  useEffect(() => {
    fetchBuckets();
    fetchFiles();
  }, [fetchBuckets, fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase
        .storage
        .from(currentFolder)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      await fetchFiles();
      alert("File uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      alert(`Failed to upload file: ${error.message}`);
    }
    setUploading(false);
    // Reset input
    e.target.value = '';
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      const { error } = await supabase
        .storage
        .from(currentFolder)
        .remove([file.name]);

      if (error) throw error;

      await fetchFiles();
      if (selectedFile?.id === file.id) {
        setSelectedFile(null);
      }
      alert("File deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting file:", error);
      alert(`Failed to delete file: ${error.message}`);
    }
  };

  const copyUrl = (file: MediaFile) => {
    navigator.clipboard.writeText(file.url);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Available buckets - will be populated from Supabase
  const availableBuckets = buckets.length > 0 ? buckets : ['listings', 'site-images'];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-outfit font-black text-gray-900 mb-2">Media Library</h1>
        <p className="text-gray-500">Manage images used across your site. Upload, organize, and delete media files.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium">{error}</p>
            <p className="text-yellow-700 text-sm mt-1">
              Go to Supabase Dashboard → Storage → New Bucket to create "{currentFolder}"
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Buckets */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Storage Buckets</h3>
            </div>
            <div className="p-2">
              {availableBuckets.map((bucket) => (
                <button
                  key={bucket}
                  onClick={() => setCurrentFolder(bucket)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    currentFolder === bucket 
                      ? "bg-[#002D72] text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Folder className="w-5 h-5" />
                  <span className="flex-1 font-medium text-sm capitalize">
                    {bucket.replace(/-/g, ' ')}
                  </span>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Current: <span className="font-medium text-gray-700">{currentFolder}</span>
              </p>
            </div>
          </div>

          {/* Storage Info */}
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 text-sm mb-2">Storage Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Files:</span>
                <span className="font-medium">{files.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Filtered:</span>
                <span className="font-medium">{filteredFiles.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#002D72] focus:border-[#002D72] outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchFiles}
                className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm text-[#002D72]" : "text-gray-500"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" ? "bg-white shadow-sm text-[#002D72]" : "text-gray-500"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <label className="flex items-center gap-2 px-4 py-2.5 bg-[#002D72] text-white font-bold rounded-lg hover:bg-[#001D4A] transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Files Display */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#002D72]" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-16 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-500 mb-6">
                {error ? "Upload an image to get started" : "This bucket is empty"}
              </p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#002D72] text-white font-bold rounded-xl hover:bg-[#001D4A] transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="relative aspect-square bg-gray-100">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/logo.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyUrl(file);
                            }}
                            className="p-2 bg-white rounded-lg shadow-lg text-[#002D72] hover:bg-blue-50 transition-colors"
                            title="Copy URL"
                          >
                            {copiedId === file.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(file);
                            }}
                            className="p-2 bg-white rounded-lg shadow-lg text-[#E31837] hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">File</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Size</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                <img 
                                  src={file.url} 
                                  alt="" 
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/logo.png';
                                  }}
                                />
                              </div>
                              <div>
                                <span className="font-medium text-gray-900 text-sm block truncate max-w-[200px]" title={file.name}>{file.name}</span>
                                <span className="text-xs text-gray-400">{file.type}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatFileSize(file.size)}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{formatDate(file.created_at)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => copyUrl(file)}
                                className="p-2 text-gray-400 hover:text-[#002D72] hover:bg-blue-50 rounded-lg transition-colors"
                                title="Copy URL"
                              >
                                {copiedId === file.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => setSelectedFile(file)}
                                className="p-2 text-gray-400 hover:text-[#002D72] hover:bg-blue-50 rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(file)}
                                className="p-2 text-gray-400 hover:text-[#E31837] hover:bg-red-50 rounded-lg transition-colors"
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
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFile(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="font-bold text-gray-900 truncate max-w-md">{selectedFile.name}</h3>
                <p className="text-xs text-gray-500">{currentFolder} bucket</p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-6">
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/logo.png';
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">File Name</label>
                  <p className="text-sm text-gray-600 break-all">{selectedFile.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Size</label>
                  <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                  <p className="text-sm text-gray-600">{selectedFile.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Uploaded</label>
                  <p className="text-sm text-gray-600">{formatDate(selectedFile.created_at)}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Path</label>
                  <p className="text-sm text-gray-600 break-all font-mono bg-gray-50 p-2 rounded">{selectedFile.path}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-2">Public URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedFile.url}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  />
                  <button
                    onClick={() => copyUrl(selectedFile)}
                    className="px-6 py-3 bg-[#002D72] text-white font-bold rounded-xl hover:bg-[#001D4A] transition-colors flex items-center gap-2"
                  >
                    {copiedId === selectedFile.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedId === selectedFile.id ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleDelete(selectedFile)}
                  className="flex-1 px-4 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
