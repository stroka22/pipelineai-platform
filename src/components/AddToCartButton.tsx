'use client';

import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { VaultItem } from '@/lib/supabase';
import { useState } from 'react';

interface AddToCartButtonProps {
  item: VaultItem;
  className?: string;
}

export default function AddToCartButton({ item, className = '' }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (!item.price) return null;

  return (
    <button
      onClick={handleAdd}
      className={`inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold hover:bg-white/20 transition-all ${className}`}
    >
      {added ? (
        <>
          <Check className="w-4 h-4" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </>
      )}
    </button>
  );
}
