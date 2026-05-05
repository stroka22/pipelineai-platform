'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, ChevronLeft, ChevronRight, X, ShoppingBag, Eye, Shield, Loader2 } from 'lucide-react';
import { supabase, VaultItem } from '@/lib/supabase';

export default function HVACVaultPage() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{name: string; count: number}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewItem, setPreviewItem] = useState<VaultItem | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function fetchItems() {
      const { data } = await supabase
        .from('vault_items')
        .select('*')
        .eq('niche', 'hvac')
        .eq('is_active', true)
        .order('display_order');
      
      if (data) {
        setItems(data);
        const catCounts: Record<string, number> = {};
        data.forEach(item => {
          catCounts[item.category] = (catCounts[item.category] || 0) + 1;
        });
        const cats = [
          { name: 'All', count: data.length },
          ...Object.entries(catCounts).map(([name, count]) => ({ name, count }))
        ];
        setCategories(cats);
      }
      setLoading(false);
    }
    fetchItems();
  }, []);

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

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

  return (
    <div className="min-h-screen bg-[#081F33]">
      <header className="bg-[#081F33] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Pipeline <span className="text-[#C96A2B]">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/70 hover:text-white text-sm font-medium">
              Back to Home
            </Link>
            <Link 
              href="https://calendly.com/brian-stroka22/30min"
              className="bg-[#C96A2B] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#B55D24] transition-all"
            >
              Book a Call
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
            HVAC Content <span className="text-[#C96A2B]">Vault</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Preview our ready-to-customize HVAC content. Each piece gets branded with your logo, 
            colors, and contact info before delivery.
          </p>
        </div>
      </section>

      <section className="py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                disabled={cat.count === 0}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-[#C96A2B] text-white'
                    : cat.count === 0
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {cat.name} {cat.count > 0 && <span className="ml-1 opacity-60">({cat.count})</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <Lock className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/60 mb-2">Coming Soon</h3>
              <p className="text-white/40">HVAC content is being added to the vault.</p>
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
                      <Image src={item.images[0]} alt={item.title} fill className="object-cover" draggable={false} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                        <div className="text-white text-4xl font-bold rotate-[-30deg] whitespace-nowrap">PIPELINE AI</div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#081F33] via-transparent to-transparent" />
                    </div>
                    <div className="absolute inset-0 bg-[#C96A2B]/0 group-hover:bg-[#C96A2B]/20 transition-all flex items-center justify-center pointer-events-auto">
                      <div className="opacity-0 group-hover:opacity-100 transition-all bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-2 text-white font-semibold">
                        <Eye className="w-5 h-5" />
                        Preview All {item.slide_count} Slides
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
                      {item.slide_count} slides
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-[#C96A2B] bg-[#C96A2B]/10 px-3 py-1 rounded-full">{item.category}</span>
                    <h3 className="text-lg font-bold text-white mt-3 mb-4">{item.title}</h3>
                    <Link
                      href="https://calendly.com/brian-stroka22/30min"
                      className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#B55D24] transition-all w-full justify-center"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Get This Customized
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Stand Out on Social Media?</h2>
          <p className="text-lg text-white/60 mb-8">Get professionally designed HVAC content customized with your branding.</p>
          <Link href="https://calendly.com/brian-stroka22/30min" className="bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#B55D24] transition-all">
            Book a Call
          </Link>
        </div>
      </section>

      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setPreviewItem(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2" onClick={() => setPreviewItem(null)}>
            <X className="w-8 h-8" />
          </button>
          <button className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-white/10 rounded-full"
            onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => prev === 0 ? previewItem.images.length - 1 : prev - 1); }}>
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-white/10 rounded-full"
            onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => (prev + 1) % previewItem.images.length); }}>
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="relative max-w-3xl max-h-[80vh] aspect-square select-none" onClick={(e) => e.stopPropagation()}>
            <Image src={previewItem.images[currentSlide]} alt={`${previewItem.title} - Slide ${currentSlide + 1}`} fill className="object-contain pointer-events-none" draggable={false} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-white/20 text-6xl font-bold rotate-[-30deg] whitespace-nowrap select-none">PIPELINE AI</div>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
              {currentSlide + 1} / {previewItem.images.length}
            </div>
          </div>
          <div className="absolute flex gap-2" style={{ bottom: '80px', left: '50%', transform: 'translateX(-50%)' }}>
            {previewItem.images.map((img, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === currentSlide ? 'border-[#C96A2B]' : 'border-white/20 opacity-50 hover:opacity-100'}`}>
                <Image src={img} alt={`Thumbnail ${i + 1}`} width={48} height={48} className="object-cover w-full h-full pointer-events-none" draggable={false} />
              </button>
            ))}
          </div>
          <div className="absolute bottom-6 right-6">
            <Link href="https://calendly.com/brian-stroka22/30min" className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#B55D24] transition-all" onClick={(e) => e.stopPropagation()}>
              <ShoppingBag className="w-5 h-5" />
              Get This Customized
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
