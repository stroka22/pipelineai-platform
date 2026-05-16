'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  ArrowLeft,
  FolderOpen,
  Download,
  Trash2,
  Star,
  Search,
  Filter,
  Grid,
  List,
  Loader2,
  Image as ImageIcon,
  X,
  ChevronDown
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ContentLibraryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNiche, setFilterNiche] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStyle, setFilterStyle] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadImages();
  }, [filterNiche, filterType, filterStyle]);

  async function loadImages() {
    setLoading(true);
    
    let query = supabase
      .from('generated_images')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
    
    if (filterNiche) query = query.eq('niche', filterNiche);
    if (filterType) query = query.eq('content_type', filterType);
    if (filterStyle) query = query.eq('style', filterStyle);
    
    const { data, error } = await query;
    
    if (data) setImages(data);
    setLoading(false);
  }

  const filteredImages = images.filter(img => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      img.title?.toLowerCase().includes(search) ||
      img.prompt_used?.toLowerCase().includes(search) ||
      img.niche?.toLowerCase().includes(search)
    );
  });

  async function toggleFavorite(id: string, current: boolean) {
    await supabase
      .from('generated_images')
      .update({ is_favorite: !current })
      .eq('id', id);
    
    setImages(images.map(img => 
      img.id === id ? { ...img, is_favorite: !current } : img
    ));
  }

  async function deleteImage(id: string) {
    if (!confirm('Delete this image?')) return;
    
    await supabase
      .from('generated_images')
      .update({ is_archived: true })
      .eq('id', id);
    
    setImages(images.filter(img => img.id !== id));
    setSelectedImage(null);
  }

  async function downloadImage(imageUrl: string, title: string) {
    try {
      if (imageUrl.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `${title || 'image'}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'image'}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      
      // Increment download count
      await supabase.rpc('increment_download_count', { image_id: selectedImage?.id });
    } catch {
      window.open(imageUrl, '_blank');
    }
  }

  const uniqueNiches = [...new Set(images.map(img => img.niche).filter(Boolean))];
  const uniqueTypes = [...new Set(images.map(img => img.content_type).filter(Boolean))];
  const uniqueStyles = [...new Set(images.map(img => img.style).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#111111] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/studio" className="text-white/60 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#C96A2B]" />
                Content Library
              </h1>
              <span className="text-white/40 text-sm">
                {filteredImages.length} images
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Search & Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search images..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
              showFilters || filterNiche || filterType || filterStyle
                ? 'bg-[#C96A2B]/20 border-[#C96A2B]/50 text-[#C96A2B]'
                : 'border-white/10 text-white/60 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filterNiche || filterType || filterStyle) && (
              <span className="bg-[#C96A2B] text-white text-xs px-1.5 rounded">
                {[filterNiche, filterType, filterStyle].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-[#111111] border border-white/10 rounded-xl">
            <div>
              <label className="block text-sm text-white/60 mb-1">Niche</label>
              <select
                value={filterNiche}
                onChange={(e) => setFilterNiche(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              >
                <option value="">All Niches</option>
                {uniqueNiches.map(niche => (
                  <option key={niche} value={niche}>{niche}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Content Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Style</label>
              <select
                value={filterStyle}
                onChange={(e) => setFilterStyle(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              >
                <option value="">All Styles</option>
                {uniqueStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
            {(filterNiche || filterType || filterStyle) && (
              <button
                onClick={() => {
                  setFilterNiche('');
                  setFilterType('');
                  setFilterStyle('');
                }}
                className="self-end px-3 py-2 text-white/60 hover:text-white text-sm"
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Image Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#C96A2B] animate-spin" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="bg-[#111111] border border-white/10 rounded-xl p-12 text-center">
            <ImageIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Images Found</h3>
            <p className="text-white/50 mb-4">
              {images.length === 0 
                ? "Generate your first image to start building your library"
                : "Try adjusting your filters"
              }
            </p>
            <Link
              href="/admin/studio/generate"
              className="bg-[#C96A2B] text-white px-4 py-2 rounded-lg font-medium inline-block"
            >
              Generate Image
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="group relative aspect-square bg-white/5 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#C96A2B] transition-all"
              >
                <img
                  src={image.image_url}
                  alt={image.title || 'Generated image'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium truncate">
                      {image.title || 'Untitled'}
                    </p>
                    <p className="text-white/60 text-xs">
                      {image.niche} • {image.style}
                    </p>
                  </div>
                </div>
                {image.is_favorite && (
                  <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="flex items-center gap-4 bg-[#111111] border border-white/10 rounded-xl p-3 cursor-pointer hover:border-white/20"
              >
                <img
                  src={image.image_url}
                  alt={image.title || 'Generated image'}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{image.title || 'Untitled'}</p>
                  <p className="text-white/50 text-sm">
                    {image.niche} • {image.content_type} • {image.style}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white/40">
                  {image.is_favorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  <span className="text-sm">
                    {new Date(image.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="bg-[#111111] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="flex-1 bg-black flex items-center justify-center p-4">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title || 'Generated image'}
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
            
            {/* Details */}
            <div className="w-full md:w-80 p-6 overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">
                  {selectedImage.title || 'Untitled'}
                </h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-white/40 text-xs uppercase mb-1">Niche</p>
                  <p className="text-white">{selectedImage.niche || '-'}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase mb-1">Type</p>
                  <p className="text-white">{selectedImage.content_type || '-'}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase mb-1">Style</p>
                  <p className="text-white">{selectedImage.style || '-'}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase mb-1">Created</p>
                  <p className="text-white">
                    {new Date(selectedImage.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase mb-1">Prompt</p>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {selectedImage.prompt_used}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => downloadImage(selectedImage.image_url, selectedImage.title)}
                  className="w-full bg-[#C96A2B] text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => toggleFavorite(selectedImage.id, selectedImage.is_favorite)}
                  className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    selectedImage.is_favorite 
                      ? 'bg-yellow-500/20 text-yellow-500' 
                      : 'bg-white/10 text-white'
                  }`}
                >
                  <Star className={`w-4 h-4 ${selectedImage.is_favorite ? 'fill-yellow-500' : ''}`} />
                  {selectedImage.is_favorite ? 'Favorited' : 'Add to Favorites'}
                </button>
                <button
                  onClick={() => deleteImage(selectedImage.id)}
                  className="w-full bg-red-500/10 text-red-500 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
