'use client';

import { useState } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';

interface BuyButtonProps {
  vaultItemId: string;
  price?: number;
  className?: string;
}

export default function BuyButton({ vaultItemId, price, className = '' }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vault_item_id: vaultItemId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start checkout');
        setLoading(false);
      }
    } catch {
      alert('Failed to start checkout');
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 bg-[#C96A2B] text-white font-semibold hover:bg-[#B55D24] transition-all disabled:opacity-70 ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ShoppingBag className="w-4 h-4" />
      )}
      {loading ? 'Loading...' : `Buy Now${price ? ` - $${price}` : ''}`}
    </button>
  );
}
