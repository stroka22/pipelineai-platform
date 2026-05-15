'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Eye, Menu, X, ShoppingCart, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase, Niche } from '@/lib/supabase';

interface HeaderProps {
  currentNiche?: string;
}

export default function Header({ currentNiche }: HeaderProps) {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [showNicheMenu, setShowNicheMenu] = useState(false);
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <Link href="/" className="text-xl md:text-2xl font-bold text-white">
          Pipeline <span className="text-[#C96A2B]">AI</span>
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
          <Link href="/#vaults" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
            Vaults
          </Link>
          <Link href="/#how-it-works" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
            How It Works
          </Link>
          <Link 
            href="/brand" 
            className="bg-[#C96A2B] hover:bg-[#B55D24] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
            title="Upload a carousel image and AI will add your business name, phone, and website"
          >
            <Sparkles className="w-4 h-4" />
            Brand Your Image
          </Link>
        </nav>

        {/* Desktop CTA + Cart */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/cart" className="relative text-white/70 hover:text-white transition-colors p-2">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C96A2B] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          {currentNiche ? (
            <Link 
              href={`/vault/${currentNiche}`}
              className="bg-[#C96A2B] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#B55D24] transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Vault
            </Link>
          ) : (
            <Link 
              href="/#vaults"
              className="bg-[#C96A2B] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#B55D24] transition-all"
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
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/5">
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
            <Link 
              href="/#how-it-works" 
              className="block px-4 py-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="/brand" 
              className="block px-4 py-3 bg-[#C96A2B] text-white rounded-lg text-base font-medium flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sparkles className="w-5 h-5" />
              Brand Your Image
            </Link>
            <div className="pt-4">
              {currentNiche ? (
                <Link 
                  href={`/vault/${currentNiche}`}
                  className="block w-full bg-[#C96A2B] text-white px-5 py-3 rounded-lg font-semibold text-center hover:bg-[#B55D24] transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Preview Vault
                </Link>
              ) : (
                <Link 
                  href="/#vaults"
                  className="block w-full bg-[#C96A2B] text-white px-5 py-3 rounded-lg font-semibold text-center hover:bg-[#B55D24] transition-all"
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
