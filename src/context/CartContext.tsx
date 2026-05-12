'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VaultItem } from '@/lib/supabase';

export interface CartItem {
  vaultItem: VaultItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: VaultItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscount: () => { amount: number; freeItems: number; message: string } | null;
  getTotal: () => number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pipeline_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('pipeline_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (vaultItem: VaultItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.vaultItem.id === vaultItem.id);
      if (existing) {
        return prev.map(i => 
          i.vaultItem.id === vaultItem.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { vaultItem, quantity: 1 }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.vaultItem.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev => prev.map(i => 
      i.vaultItem.id === itemId ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setItems([]);

  const getSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.vaultItem.price || 0) * item.quantity, 0);
  };

  // Buy 2 Get 1 Free for 10-slide carousels
  const getDiscount = () => {
    // Count 10-slide carousel items
    const carouselItems = items.filter(i => i.vaultItem.slide_count === 10);
    const totalCarousels = carouselItems.reduce((sum, i) => sum + i.quantity, 0);
    
    if (totalCarousels >= 3) {
      // For every 3 carousels, 1 is free (the cheapest one)
      const freeItems = Math.floor(totalCarousels / 3);
      
      // Get all carousel prices sorted ascending
      const carouselPrices: number[] = [];
      carouselItems.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
          carouselPrices.push(item.vaultItem.price || 0);
        }
      });
      carouselPrices.sort((a, b) => a - b);
      
      // Free items are the cheapest ones
      const discountAmount = carouselPrices.slice(0, freeItems).reduce((sum, p) => sum + p, 0);
      
      return {
        amount: discountAmount,
        freeItems,
        message: `Buy 2 Get 1 Free! ${freeItems} carousel${freeItems > 1 ? 's' : ''} free`,
      };
    }
    
    return null;
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const discount = getDiscount();
    return subtotal - (discount?.amount || 0);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getSubtotal,
      getDiscount,
      getTotal,
      itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
