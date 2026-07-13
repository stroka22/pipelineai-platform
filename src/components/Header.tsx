'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Eye, Menu, X, ShoppingCart, Sparkles, Info, Calendar } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase, Niche } from '@/lib/supabase';

interface HeaderProps {
  currentNiche?: string;
}

export default function Header({ currentNiche }: HeaderProps) {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [showNicheMenu, setShowNicheMenu] = useState(false);
  const [showGalleryMenu, setShowGalleryMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => {
    async function fetchNiches() {
      const { data } = await supabase
        .from('niches')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (data) setNiches(data);
    }
    fetchNiches();
  }, []);

  const getNicheEmoji = (niche: Niche) => {
    if (niche.icon) return niche.icon;
    const fallbacks: Record<string, string> = {
      'pest-control': '🪲',
      'roofing': '🏠',
      'hvac': '❄️',
      'plumbing': '🔧',
    };
    return fallbacks[niche.slug] || '📦';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-icon.png" alt="Pipeline AI" className="h-9 w-9 rounded-xl" />
          <span className="text-xl md:text-2xl font-bold flex items-center gap-1">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">PIPELINE</span>
            <span className="text-white">AI</span>
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
            Home
          </Link>
          <div 
            className="relative"
            onMouseEnter={() => setShowNicheMenu(true)}
            onMouseLeave={() => setShowNicheMenu(false)}
          >
            <button 
              className="text-white/70 hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
            >
              Niches
              <ChevronDown className={`w-4 h-4 transition-transform ${showNicheMenu ? 'rotate-180' : ''}`} />
            </button>
            {showNicheMenu && (
              <div className="absolute top-full left-0 pt-2">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-lg py-2 min-w-[200px] shadow-xl">
                {niches.map(niche => (
                  <Link
                    key={niche.slug}
                    href={`/industries/${niche.slug}`}
                    className="block px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 text-sm"
                  >
                    {getNicheEmoji(niche)} {niche.name}
                  </Link>
                ))}
                {niches.length === 0 && (
                  <span className="block px-4 py-2 text-white/50 text-sm">Loading...</span>
                )}
                </div>
              </div>
            )}
          </div>
          {niches.filter(n => n.has_gallery_page).length > 0 && (
          <div 
            className="relative"
            onMouseEnter={() => setShowGalleryMenu(true)}
            onMouseLeave={() => setShowGalleryMenu(false)}
          >
            <button 
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium flex items-center gap-1"
            >
              Galleries
              <ChevronDown className={`w-4 h-4 transition-transform ${showGalleryMenu ? 'rotate-180' : ''}`} />
            </button>
            {showGalleryMenu && (
              <div className="absolute top-full left-0 pt-2">
                <div className="bg-[#1a1a1a] border border-blue-500/20 rounded-lg py-2 min-w-[200px] shadow-xl">
                {niches.filter(n => n.has_gallery_page).map(niche => (
                  <Link
                    key={`gallery-${niche.slug}`}
                    href={`/gallery/${niche.gallery_slug || niche.slug}`}
                    className="block px-4 py-2 text-white/70 hover:text-white hover:bg-white/5 text-sm"
                  >
                    {niche.icon || '✦'} {niche.name}
                  </Link>
                ))}
                </div>
              </div>
            )}
          </div>
          )}
          <Link href="/#vaults" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
            Vaults
          </Link>
          <Link href="/#how-it-works" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
            How It Works
          </Link>
          <a 
            href="https://calendly.com/getpipelineai-support/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Calendar className="w-4 h-4" />
            Book a Call
          </a>
{/* Branding Tool - Hidden until perfected
          <div className="relative group">
            <Link 
              href="/brand" 
              className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20"
            >
              <Sparkles className="w-4 h-4" />
              Branding Tool
            </Link>
          </div>
*/}
        </nav>

        {/* Desktop CTA + Cart */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/cart" className="relative text-white/70 hover:text-white transition-colors p-2">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          {currentNiche ? (
            <Link 
              href={`/vault/${currentNiche}`}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:from-blue-500 hover:to-blue-400 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Eye className="w-4 h-4" />
              Preview Vault
            </Link>
          ) : (
            <Link 
              href="/#vaults"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20"
            >
              Browse Vaults
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#030712] border-t border-white/5">
          <nav className="px-4 py-4 space-y-1">
            <Link 
              href="/" 
              className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <div className="px-4 py-2 text-white/40 text-xs uppercase tracking-wider">Niches</div>
            {niches.map(niche => (
              <Link
                key={niche.slug}
                href={`/industries/${niche.slug}`}
                className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-base"
                onClick={() => setMobileMenuOpen(false)}
              >
                {getNicheEmoji(niche)} {niche.name}
              </Link>
            ))}
            <Link 
              href="/#vaults" 
              className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              All Vaults
            </Link>
            <Link 
              href="/cart" 
              className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-base font-medium flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart className="w-5 h-5" />
              Cart {itemCount > 0 && `(${itemCount})`}
            </Link>
            {niches.filter(n => n.has_gallery_page).length > 0 && (
              <>
                <div className="px-4 py-2 text-white/30 text-xs uppercase tracking-wider">Galleries</div>
                {niches.filter(n => n.has_gallery_page).map(niche => (
                  <Link 
                    key={`mobile-gallery-${niche.slug}`}
                    href={`/gallery/${niche.gallery_slug || niche.slug}`} 
                    className="block px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-white/5 rounded-lg text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {niche.icon || '✦'} {niche.name}
                  </Link>
                ))}
              </>
            )}
            <Link 
              href="/#how-it-works" 
              className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <a 
              href="https://calendly.com/getpipelineai-support/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg text-base font-medium flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Calendar className="w-5 h-5" />
              Book a Strategy Call
            </a>
{/* Branding Tool - Hidden until perfected
            <Link 
              href="/brand" 
              className="block px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg text-base font-medium flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sparkles className="w-5 h-5" />
              Branding Tool
            </Link>
*/}
            <div className="pt-4">
              {currentNiche ? (
                <Link 
                  href={`/vault/${currentNiche}`}
                  className="block w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-3 rounded-lg font-semibold text-center transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Preview Vault
                </Link>
              ) : (
                <Link 
                  href="/#vaults"
                  className="block w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-3 rounded-lg font-semibold text-center transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Vaults
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
