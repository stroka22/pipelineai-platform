'use client';

import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, getDiscount, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const discount = getDiscount();
  const subtotal = getSubtotal();
  const total = getTotal();

  // Count 10-slide carousels for promo messaging
  const carouselCount = items
    .filter(i => i.vaultItem.slide_count === 10)
    .reduce((sum, i) => sum + i.quantity, 0);
  const carouselsNeeded = carouselCount < 3 ? 3 - carouselCount : 0;

  async function handleCheckout() {
    if (items.length === 0) return;
    setLoading(true);

    try {
      const response = await fetch('/api/checkout/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            vaultItemId: i.vaultItem.id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Checkout failed');
        setLoading(false);
      }
    } catch (error) {
      alert('Checkout failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/50 mb-6">Your cart is empty</p>
              <Link
                href="/#vaults"
                className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#B55D24] transition-all"
              >
                Browse Vaults
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Promo Banner */}
                {carouselsNeeded > 0 && (
                  <div className="bg-[#C96A2B]/20 border border-[#C96A2B]/50 rounded-xl p-4 flex items-center gap-3">
                    <Tag className="w-5 h-5 text-[#C96A2B]" />
                    <p className="text-white text-sm">
                      <strong>Buy 2 Get 1 Free!</strong> Add {carouselsNeeded} more 10-slide carousel{carouselsNeeded > 1 ? 's' : ''} to get one free!
                    </p>
                  </div>
                )}

                {items.map(({ vaultItem, quantity }) => (
                  <div key={vaultItem.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
                    <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                      {vaultItem.images[0] && (
                        <Image
                          src={vaultItem.images[0]}
                          alt={vaultItem.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="text-white font-semibold truncate">{vaultItem.title}</h3>
                          <p className="text-white/50 text-sm">{vaultItem.category}</p>
                          {vaultItem.slide_count === 10 && (
                            <span className="inline-block mt-1 text-xs bg-[#C96A2B]/20 text-[#C96A2B] px-2 py-0.5 rounded">
                              10-Slide Carousel
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(vaultItem.id)}
                          className="text-white/40 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(vaultItem.id, quantity - 1)}
                            className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-semibold w-8 text-center">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(vaultItem.id, quantity + 1)}
                            className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-white font-bold">${((vaultItem.price || 0) * quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={clearCart}
                  className="text-white/40 hover:text-white/70 text-sm transition-colors"
                >
                  Clear cart
                </button>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-24">
                  <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-white/70">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    
                    {discount && (
                      <div className="flex justify-between text-green-400">
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {discount.message}
                        </span>
                        <span>-${discount.amount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-white/10 pt-3 flex justify-between text-white font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading || items.length === 0}
                    className="w-full mt-6 bg-[#C96A2B] text-white py-3 rounded-lg font-semibold hover:bg-[#B55D24] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    ) : (
                      <>
                        Checkout
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-white/40 text-xs text-center mt-4">
                    Secure checkout powered by Stripe
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
