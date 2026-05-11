'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Lock, ChevronLeft, ChevronRight, X, ShoppingBag, Eye, Shield, Loader2, Play, AlertTriangle } from 'lucide-react';
import { supabase, VaultItem, Niche } from '@/lib/supabase';
import BuyButton from '@/components/BuyButton';

function isVideo(url: string): boolean {
  return /\.(mp4|webm|mov|avi)$/i.test(url);
}

export default function VaultPage({ params }: { params: Promise<{ niche: string }> }) {
  const { niche: nicheSlug } = use(params);
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [niche, setNiche] = useState<Niche | null>(null);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [categories, setCategories] = useState<{name: string; count: number}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
  const [previewItem, setPreviewItem] = useState<VaultItem | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Show resale warning on first visit
  useEffect(() => {
    const hasSeenWarning = localStorage.getItem('vault_warning_seen');
    if (!hasSeenWarning) {
      setShowWarning(true);
    }
  }, []);

  function acceptWarning() {
    localStorage.setItem('vault_warning_seen', 'true');
    setShowWarning(false);
  }

  useEffect(() => {
    async function fetchData() {
      // Fetch niche info
      const { data: nicheData } = await supabase
        .from('niches')
        .select('*')
        .eq('slug', nicheSlug)
        .eq('is_active', true)
        .single();
      
      if (!nicheData) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      
      setNiche(nicheData);
      
      // Fetch vault items
      const { data: itemsData } = await supabase
        .from('vault_items')
        .select('*')
        .eq('niche', nicheSlug)
        .eq('is_active', true)
        .order('display_order');
      
      if (itemsData) {
        setItems(itemsData);
        const catCounts: Record<string, number> = {};
        itemsData.forEach(item => {
          catCounts[item.category] = (catCounts[item.category] || 0) + 1;
        });
        const cats = [
          { name: 'All', count: itemsData.length },
          ...Object.entries(catCounts).map(([name, count]) => ({ name, count }))
        ];
        setCategories(cats);
      }
      setLoading(false);
    }
    fetchData();
  }, [nicheSlug]);

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  // Disable right-click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!previewItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setCurrentSlide(prev => (prev + 1) % previewItem.images.length);
      else if (e.key === 'ArrowLeft') setCurrentSlide(prev => prev === 0 ? previewItem.images.length - 1 : prev - 1);
      else if (e.key === 'Escape') setPreviewItem(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [previewItem]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081F33] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C96A2B]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#081F33] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Vault Not Found</h1>
          <p className="text-white/60 mb-8">This content vault doesn&apos;t exist yet.</p>
          <Link href="/" className="bg-[#C96A2B] text-white px-6 py-3 rounded-lg font-semibold">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#081F33]">
      <header className="bg-[#081F33] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Pipeline <span className="text-[#C96A2B]">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/70 hover:text-white text-sm font-medium">
              Home
            </Link>
            <Link href="/#vaults" className="text-white/70 hover:text-white text-sm font-medium">
              All Vaults
            </Link>
            <Link 
              href={`/industries/${nicheSlug}`}
              className="bg-[#C96A2B] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#B55D24] transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop {niche?.name || 'Vault'}
            </Link>
          </div>
        </div>
      </header>

      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#C96A2B]/20 text-[#C96A2B] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" />
            Protected Content Vault
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {niche?.name} Content <span className="text-[#C96A2B]">Vault</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            {niche?.description || `Preview premium ${niche?.name} growth content. Purchase and download instantly to start posting today.`}
          </p>
        </div>
      </section>

      {categories.length > 1 && (
        <section className="py-8 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-[#C96A2B] text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {cat.name} <span className="ml-1 opacity-60">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <Lock className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/60 mb-2">Coming Soon</h3>
              <p className="text-white/40">Content is being added to this vault.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div 
                  key={item.id}
                  className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-[#C96A2B]/50 transition-all"
                >
                  <div 
                    className="relative aspect-square cursor-pointer"
                    onClick={() => { setPreviewItem(item); setCurrentSlide(0); }}
                  >
                    <div className="relative w-full h-full select-none pointer-events-none">
                      {isVideo(item.images[0]) ? (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <video src={item.images[0]} className="w-full h-full object-cover" muted />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                              <Play className="w-8 h-8 text-white ml-1" fill="white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Image src={item.images[0]} alt={item.title} fill className="object-cover" draggable={false} />
                      )}
                      {/* Tiled watermark pattern */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                        <div className="absolute inset-0 flex flex-col justify-around py-4">
                          {[0, 1, 2, 3, 4, 5].map((row) => (
                            <div key={row} className="flex justify-around">
                              {[0, 1, 2, 3].map((col) => (
                                <div 
                                  key={col} 
                                  className="text-white font-black rotate-[-30deg] whitespace-nowrap text-lg"
                                  style={{ 
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                    opacity: 0.5
                                  }}
                                >
                                  PREVIEW
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#081F33] via-transparent to-transparent" />
                    </div>
                    <div className="absolute inset-0 bg-[#C96A2B]/0 group-hover:bg-[#C96A2B]/20 transition-all flex items-center justify-center pointer-events-auto">
                      <div className="opacity-0 group-hover:opacity-100 transition-all bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-2 text-white font-semibold">
                        <Eye className="w-5 h-5" />
                        {item.content_type === 'video' || item.content_type === 'reel' ? 'Watch Preview' : `Preview All ${item.slide_count} Slides`}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
                      {item.content_type === 'video' || item.content_type === 'reel' ? 'Video' : `${item.slide_count} slides`}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[#C96A2B] bg-[#C96A2B]/10 px-3 py-1 rounded-full">{item.category}</span>
                      {item.price && (
                        <span className="text-xl font-bold text-white">${item.price}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-4">{item.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setPreviewItem(item); setCurrentSlide(0); }}
                        className="flex-1 inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-white/20 transition-all justify-center"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      {item.price ? (
                        <BuyButton 
                          vaultItemId={item.id} 
                          price={item.price} 
                          className="flex-1 px-4 py-2.5 rounded-lg text-sm"
                        />
                      ) : (
                        <span className="flex-1 inline-flex items-center justify-center bg-white/5 text-white/50 px-4 py-2.5 rounded-lg text-sm">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Grow Your Social Media Presence?</h2>
          <p className="text-lg text-white/60 mb-8">Purchase premium content and start posting today. Instant download after payment.</p>
          <Link href={`/industries/${nicheSlug}`} className="bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#B55D24] transition-all inline-flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Shop This Vault
          </Link>
        </div>
      </section>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setPreviewItem(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-10" onClick={() => setPreviewItem(null)}>
            <X className="w-8 h-8" />
          </button>
          
          {previewItem.images.length > 1 && (
            <>
              <button className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-white/10 rounded-full z-10"
                onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => prev === 0 ? previewItem.images.length - 1 : prev - 1); }}>
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-white/10 rounded-full z-10"
                onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => (prev + 1) % previewItem.images.length); }}>
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
          
          <div className="relative w-[80vw] h-[70vh] max-w-4xl select-none flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {isVideo(previewItem.images[currentSlide]) ? (
              <video 
                src={previewItem.images[currentSlide]} 
                className="max-w-full max-h-full object-contain"
                controls
                autoPlay
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={previewItem.images[currentSlide]} 
                  alt={`${previewItem.title} - Slide ${currentSlide + 1}`} 
                  className="max-w-full max-h-full object-contain pointer-events-none" 
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                {/* Tiled watermark pattern */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                  <div className="absolute inset-0 flex flex-col justify-around py-8">
                    {[0, 1, 2, 3, 4, 5, 6].map((row) => (
                      <div key={row} className="flex justify-around">
                        {[0, 1, 2, 3, 4].map((col) => (
                          <div 
                            key={col} 
                            className="text-white font-black rotate-[-30deg] whitespace-nowrap text-2xl md:text-3xl"
                            style={{ 
                              textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
                              opacity: 0.6
                            }}
                          >
                            PREVIEW
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {previewItem.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                {currentSlide + 1} / {previewItem.images.length}
              </div>
            )}
          </div>
          
          {previewItem.images.length > 1 && (
            <div className="absolute flex gap-2" style={{ bottom: '80px', left: '50%', transform: 'translateX(-50%)' }}>
              {previewItem.images.slice(0, 10).map((img, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === currentSlide ? 'border-[#C96A2B]' : 'border-white/20 opacity-50 hover:opacity-100'}`}>
                  {isVideo(img) ? (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <Play className="w-4 h-4 text-white" fill="white" />
                    </div>
                  ) : (
                    <Image src={img} alt={`Thumbnail ${i + 1}`} width={48} height={48} className="object-cover w-full h-full pointer-events-none" draggable={false} />
                  )}
                </button>
              ))}
              {previewItem.images.length > 10 && (
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs">
                  +{previewItem.images.length - 10}
                </div>
              )}
            </div>
          )}
          
          <div className="absolute bottom-6 right-6" onClick={(e) => e.stopPropagation()}>
            {previewItem.price ? (
              <BuyButton 
                vaultItemId={previewItem.id} 
                price={previewItem.price} 
                className="px-6 py-3 rounded-xl"
              />
            ) : (
              <span className="inline-flex items-center gap-2 bg-white/20 text-white/70 px-6 py-3 rounded-xl font-semibold">
                <ShoppingBag className="w-5 h-5" />
                Coming Soon
              </span>
            )}
          </div>
        </div>
      )}

      {/* Resale Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a2540] rounded-2xl border border-[#C96A2B]/30 max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-[#C96A2B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-[#C96A2B]" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Content License Agreement</h2>
            
            <div className="text-white/70 text-sm space-y-4 mb-8 text-left">
              <p>
                All content displayed in this vault is protected by copyright and licensed 
                exclusively for single-business commercial use.
              </p>
              <p className="font-semibold text-white">
                By continuing, you agree that:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>You will not resell, redistribute, or share purchased content</li>
                <li>You will not claim ownership or authorship of the content</li>
                <li>You will use purchased content for one business only</li>
                <li>Violations may result in legal action and account termination</li>
              </ul>
            </div>
            
            <button
              onClick={acceptWarning}
              className="w-full bg-[#C96A2B] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#B55D24] transition-all"
            >
              I Understand & Agree
            </button>
            
            <p className="text-white/40 text-xs mt-4">
              Pipeline AI reserves the right to pursue legal remedies for license violations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
