'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
  ChevronDown,
  ShoppingBag,
  DollarSign,
  CheckSquare,
  Square
} from 'lucide-react';

export default function ContentLibraryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  
  // Multi-select mode
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNiche, setFilterNiche] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStyle, setFilterStyle] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Add to Vault modal
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [vaultForm, setVaultForm] = useState({
    price: '5.00',
    caption: '',
    category: '',
    niche: '',
    title: '',
    addAsCarousel: true, // Default to carousel for multi-select
  });
  const [niches, setNiches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [addingToVault, setAddingToVault] = useState(false);

  useEffect(() => {
    loadImages();
    loadNichesAndCategories();
  }, [filterNiche, filterType, filterStyle]);

  async function loadNichesAndCategories() {
    const [nichesRes, catsRes] = await Promise.all([
      supabase.from('niches').select('*').order('name'),
      supabase.from('categories').select('*').order('name'),
    ]);
    if (nichesRes.data) setNiches(nichesRes.data);
    if (catsRes.data) setCategories(catsRes.data);
  }

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

  function toggleSelectMode() {
    setSelectMode(!selectMode);
    setSelectedIds(new Set());
  }

  function toggleImageSelection(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  function selectAll() {
    setSelectedIds(new Set(filteredImages.map(img => img.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  function openBulkVaultModal() {
    if (selectedIds.size === 0) {
      alert('Select images first');
      return;
    }
    setVaultForm({
      price: '5.00',
      caption: '',
      category: '',
      niche: '',
      title: '',
      addAsCarousel: selectedIds.size > 1, // Default to carousel if multiple selected
    });
    setShowVaultModal(true);
  }

  async function addSelectedToVault() {
    if (selectedIds.size === 0) return;
    
    setAddingToVault(true);
    // Sort by created_at ascending so oldest (slide 1) comes first
    const selectedImages = images
      .filter(img => selectedIds.has(img.id))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    try {
      // Upload all images and collect URLs
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < selectedImages.length; i++) {
        const img = selectedImages[i];
        let fileUrl = img.image_url;
        
        // Upload to storage if base64
        if (img.image_url.startsWith('data:')) {
          const base64Data = img.image_url.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let j = 0; j < byteCharacters.length; j++) {
            byteNumbers[j] = byteCharacters.charCodeAt(j);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          
          const fileName = `vault-${Date.now()}-${i}.png`;
          const { error: uploadError } = await supabase.storage
            .from('Vault')
            .upload(fileName, blob);
          
          if (uploadError) throw uploadError;
          
          const { data: publicUrl } = supabase.storage
            .from('Vault')
            .getPublicUrl(fileName);
          
          fileUrl = publicUrl.publicUrl;
        }
        
        uploadedUrls.push(fileUrl);
      }
      
      if (vaultForm.addAsCarousel) {
        // Add as single carousel product
        const { error: insertError } = await supabase
          .from('vault_items')
          .insert({
            title: vaultForm.title || `${selectedImages.length}-Slide Carousel`,
            images: uploadedUrls,
            folder_path: '',
            price: parseFloat(vaultForm.price),
            caption: vaultForm.caption,
            category: vaultForm.category || null,
            niche: vaultForm.niche || null,
            content_type: 'carousel',
            slide_count: uploadedUrls.length,
            is_active: true,
          });
        
        if (insertError) throw insertError;
        alert(`Added ${selectedImages.length}-slide carousel to vault!`);
      } else {
        // Add as separate items (single images)
        for (let i = 0; i < uploadedUrls.length; i++) {
          const { error: insertError } = await supabase
            .from('vault_items')
            .insert({
              title: selectedImages[i].title || `Image ${i + 1}`,
              images: [uploadedUrls[i]],
              folder_path: '',
              price: parseFloat(vaultForm.price),
              caption: vaultForm.caption,
              category: vaultForm.category || null,
              niche: vaultForm.niche || null,
              content_type: 'single',
              slide_count: 1,
              is_active: true,
            });
          
          if (insertError) throw insertError;
        }
        alert(`Added ${selectedImages.length} images to vault!`);
      }
      
      setShowVaultModal(false);
      setSelectMode(false);
      setSelectedIds(new Set());
    } catch (error: any) {
      console.error('Error adding to vault:', error);
      alert('Failed to add to vault: ' + error.message);
    } finally {
      setAddingToVault(false);
    }
  }

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

  function openVaultModal() {
    if (!selectedImage) return;
    setVaultForm({
      price: '5.00',
      caption: selectedImage.title || '',
      category: '',
      niche: selectedImage.niche || '',
      title: selectedImage.title || '',
      addAsCarousel: false,
    });
    setShowVaultModal(true);
  }

  async function addToVault() {
    if (!selectedImage) return;
    
    setAddingToVault(true);
    
    try {
      // Convert image URL to blob and upload to Supabase storage
      let fileUrl = selectedImage.image_url;
      
      if (selectedImage.image_url.startsWith('data:')) {
        // Upload base64 to storage
        const base64Data = selectedImage.image_url.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        
        const fileName = `vault-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('Vault')
          .upload(fileName, blob);
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrl } = supabase.storage
          .from('Vault')
          .getPublicUrl(fileName);
        
        fileUrl = publicUrl.publicUrl;
      }
      
      // Create vault item
      const { error: insertError } = await supabase
        .from('vault_items')
        .insert({
          title: selectedImage.title || 'Untitled',
          images: [fileUrl],
          folder_path: '',
          price: parseFloat(vaultForm.price),
          caption: vaultForm.caption,
          category: vaultForm.category || null,
          niche: vaultForm.niche || null,
          content_type: 'single',
          slide_count: 1,
          is_active: true,
        });
      
      if (insertError) throw insertError;
      
      alert('Added to vault successfully!');
      setShowVaultModal(false);
      setSelectedImage(null);
    } catch (error: any) {
      console.error('Error adding to vault:', error);
      alert('Failed to add to vault: ' + error.message);
    } finally {
      setAddingToVault(false);
    }
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
              {/* Multi-select controls */}
              {selectMode ? (
                <>
                  <span className="text-white/60 text-sm">
                    {selectedIds.size} selected
                  </span>
                  <button
                    onClick={selectAll}
                    className="px-3 py-1.5 text-sm text-white/60 hover:text-white"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-1.5 text-sm text-white/60 hover:text-white"
                  >
                    Deselect
                  </button>
                  <button
                    onClick={openBulkVaultModal}
                    disabled={selectedIds.size === 0}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Vault ({selectedIds.size})
                  </button>
                  <button
                    onClick={toggleSelectMode}
                    className="px-3 py-1.5 text-sm border border-white/20 text-white rounded-lg hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={toggleSelectMode}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-white/20 text-white rounded-lg hover:bg-white/5"
                >
                  <CheckSquare className="w-4 h-4" />
                  Select Multiple
                </button>
              )}
              
              <div className="w-px h-6 bg-white/10 mx-2" />
              
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
                onClick={() => selectMode ? toggleImageSelection(image.id) : setSelectedImage(image)}
                className={`group relative aspect-square bg-white/5 rounded-xl overflow-hidden cursor-pointer transition-all ${
                  selectedIds.has(image.id) 
                    ? 'ring-2 ring-green-500' 
                    : 'hover:ring-2 hover:ring-[#C96A2B]'
                }`}
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
                {/* Checkbox for select mode */}
                {selectMode && (
                  <div className="absolute top-2 left-2">
                    {selectedIds.has(image.id) ? (
                      <CheckSquare className="w-6 h-6 text-green-500 fill-green-500/20" />
                    ) : (
                      <Square className="w-6 h-6 text-white/60" />
                    )}
                  </div>
                )}
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
                onClick={() => selectMode ? toggleImageSelection(image.id) : setSelectedImage(image)}
                className={`flex items-center gap-4 bg-[#111111] border rounded-xl p-3 cursor-pointer ${
                  selectedIds.has(image.id)
                    ? 'border-green-500 bg-green-500/5'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Checkbox for select mode */}
                {selectMode && (
                  <div className="flex-shrink-0">
                    {selectedIds.has(image.id) ? (
                      <CheckSquare className="w-5 h-5 text-green-500" />
                    ) : (
                      <Square className="w-5 h-5 text-white/40" />
                    )}
                  </div>
                )}
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
                  onClick={openVaultModal}
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Vault (Sell)
                </button>
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

      {/* Add to Vault Modal - handles both single and bulk */}
      {showVaultModal && (selectedImage || selectedIds.size > 0) && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowVaultModal(false)}
        >
          <div 
            className="bg-[#111111] border border-white/10 rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-green-500" />
                {selectMode ? `Add ${selectedIds.size} Images to Vault` : 'Add to Vault'}
              </h3>
              <button
                onClick={() => setShowVaultModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Preview - single image or grid of selected */}
            {selectMode ? (
              <div className="mb-6">
                <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto">
                  {images.filter(img => selectedIds.has(img.id)).slice(0, 10).map(img => (
                    <img
                      key={img.id}
                      src={img.image_url}
                      alt="Preview"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                  {selectedIds.size > 10 && (
                    <div className="w-full aspect-square bg-white/10 rounded-lg flex items-center justify-center text-white/60 text-sm">
                      +{selectedIds.size - 10}
                    </div>
                  )}
                </div>
                
                {/* Add as Carousel or Separate toggle */}
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setVaultForm({ ...vaultForm, addAsCarousel: true })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        vaultForm.addAsCarousel 
                          ? 'bg-green-600 text-white' 
                          : 'bg-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      Single Carousel Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setVaultForm({ ...vaultForm, addAsCarousel: false })}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        !vaultForm.addAsCarousel 
                          ? 'bg-green-600 text-white' 
                          : 'bg-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      Separate Items
                    </button>
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    {vaultForm.addAsCarousel 
                      ? `All ${selectedIds.size} slides sold as one carousel product`
                      : `Each slide sold separately (${selectedIds.size} products)`
                    }
                  </p>
                </div>
              </div>
            ) : selectedImage && (
              <div className="flex gap-4 mb-6">
                <img
                  src={selectedImage.image_url}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-white font-medium">{selectedImage.title || 'Untitled'}</p>
                  <p className="text-white/50 text-sm">{selectedImage.niche}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Title field for carousel mode */}
              {selectMode && vaultForm.addAsCarousel && (
                <div>
                  <label className="block text-sm text-white/60 mb-1">
                    Carousel Title *
                  </label>
                  <input
                    type="text"
                    value={vaultForm.title}
                    onChange={(e) => setVaultForm({ ...vaultForm, title: e.target.value })}
                    placeholder="e.g., 5 Roofing Myths Exposed"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Price ($) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={vaultForm.price}
                    onChange={(e) => setVaultForm({ ...vaultForm, price: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Niche
                </label>
                <select
                  value={vaultForm.niche}
                  onChange={(e) => setVaultForm({ ...vaultForm, niche: e.target.value, category: '' })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="">Select niche...</option>
                  {niches.map(niche => (
                    <option key={niche.id} value={niche.slug}>{niche.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Category
                </label>
                <select
                  value={vaultForm.category}
                  onChange={(e) => setVaultForm({ ...vaultForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  disabled={!vaultForm.niche}
                >
                  <option value="">{vaultForm.niche ? 'Select category...' : 'Select niche first'}</option>
                  {categories
                    .filter(cat => cat.niche_slug === vaultForm.niche)
                    .map(cat => (
                      <option key={cat.id} value={cat.slug || cat.name}>{cat.name}</option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Caption (for buyers)
                </label>
                <textarea
                  value={vaultForm.caption}
                  onChange={(e) => setVaultForm({ ...vaultForm, caption: e.target.value })}
                  rows={3}
                  placeholder="Caption buyers can copy for their post..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowVaultModal(false)}
                className="flex-1 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={selectMode ? addSelectedToVault : addToVault}
                disabled={addingToVault || !vaultForm.price}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50"
              >
                {addingToVault ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    {selectMode ? `Add ${selectedIds.size} to Vault` : 'Add to Vault'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
