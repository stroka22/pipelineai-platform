'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, Eye } from 'lucide-react';
import { supabase, Niche } from '@/lib/supabase';

interface HeaderProps {
  currentNiche?: string;
}

export default function Header({ currentNiche }: HeaderProps) {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [showNicheMenu, setShowNicheMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white">
          Pipeline <span className="text-[#C96A2B]">AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
            Home
          </Link>
          <div 
            className="relative"
            ref={menuRef}
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
              <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg py-2 min-w-[200px] shadow-xl">
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
            )}
          </div>
          <Link href="/#vaults" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
            Vaults
          </Link>
          <Link href="/#how-it-works" className="text-white/70 hover:text-white transition-colors text-sm font-medium">
            How It Works
          </Link>
        </nav>
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
    </header>
  );
}
