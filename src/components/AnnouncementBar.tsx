'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'pa_logo_promo_dismissed';

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1') {
      setDismissed(true);
    }
  }, []);

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-center text-xs md:text-sm py-2 px-9">
      <Link href="/free-premium-logo" className="font-semibold hover:underline">
        🎁 Claim a FREE Premium Logo for your business - no purchase required →
      </Link>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => {
          setDismissed(true);
          if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, '1');
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
