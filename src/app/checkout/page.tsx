'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, Product } from '@/lib/supabase';
import { ArrowLeft, Upload, Check, Loader2 } from 'lucide-react';

function CheckoutForm() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [form, setForm] = useState({
    buyer_name: '',
    buyer_email: '',
    company_name: '',
    phone_number: '',
    company_website: '',
    service_area: '',
    brand_colors: '',
    cta_text: '',
    notes: '',
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [productId]);

  async function fetchProduct() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (!error && data) {
      setProduct(data);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    
    setSubmitting(true);
    
    // Create order in Supabase
    const { error } = await supabase.from('orders').insert([{
      product_id: product.id,
      product_title: product.title,
      amount: product.sale_price || product.price,
      buyer_name: form.buyer_name,
      buyer_email: form.buyer_email,
      company_name: form.company_name,
      phone_number: form.phone_number,
      company_website: form.company_website || null,
      service_area: form.service_area || null,
      brand_colors: form.brand_colors || null,
      cta_text: form.cta_text || null,
      notes: form.notes || null,
      status: 'new',
    }]);
    
    if (error) {
      alert('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }
    
    // Redirect to Stripe
    if (product.stripe_link) {
      window.location.href = product.stripe_link;
    } else {
      setSubmitted(true);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F3EA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C96A2B]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F3EA] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#081F33] mb-4">Product Not Found</h1>
          <Link href="/industries/pest-control" className="text-[#C96A2B] hover:underline">
            ← Back to store
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8F3EA] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-10 max-w-md text-center shadow-xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#081F33] mb-4">Order Received!</h1>
          <p className="text-[#4B5563] mb-6">
            We&apos;ve received your order for <strong>{product.title}</strong>. 
            We&apos;ll be in touch within 24 hours to get started on your content.
          </p>
          <Link 
            href="/industries/pest-control"
            className="inline-block bg-[#C96A2B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#B55D24] transition-all"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F3EA]">
      {/* Header */}
      <header className="bg-[#081F33] py-4">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/industries/pest-control" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to store
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h1 className="text-2xl font-bold text-[#081F33] mb-2">Complete Your Order</h1>
              <p className="text-[#4B5563] mb-8">
                Tell us about your business so we can customize your content.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h2 className="text-lg font-semibold text-[#081F33] mb-4">Contact Information</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#081F33] mb-2">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={form.buyer_name}
                        onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#081F33] mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        value={form.buyer_email}
                        onChange={(e) => setForm({ ...form, buyer_email: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                        placeholder="john@pestcompany.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#081F33] mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={form.phone_number}
                        onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#081F33] mb-2">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={form.company_name}
                        onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                        placeholder="ABC Pest Control"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div>
                  <h2 className="text-lg font-semibold text-[#081F33] mb-4">Business Details</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#081F33] mb-2">Website</label>
                      <input
                        type="url"
                        value={form.company_website}
                        onChange={(e) => setForm({ ...form, company_website: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                        placeholder="https://pestcompany.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#081F33] mb-2">Service Area</label>
                      <input
                        type="text"
                        value={form.service_area}
                        onChange={(e) => setForm({ ...form, service_area: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                        placeholder="Houston, TX and surrounding areas"
                      />
                    </div>
                  </div>
                </div>

                {/* Branding */}
                <div>
                  <h2 className="text-lg font-semibold text-[#081F33] mb-4">Branding</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#081F33] mb-2">Brand Colors</label>
                      <input
                        type="text"
                        value={form.brand_colors}
                        onChange={(e) => setForm({ ...form, brand_colors: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                        placeholder="e.g., Green (#22C55E), Navy Blue, White"
                      />
                      <p className="text-xs text-[#9CA3AF] mt-1">List your primary brand colors</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#081F33] mb-2">Call-to-Action Text</label>
                      <input
                        type="text"
                        value={form.cta_text}
                        onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                        placeholder="e.g., Call Now for a Free Inspection!"
                      />
                      <p className="text-xs text-[#9CA3AF] mt-1">What do you want viewers to do?</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#081F33] mb-2">Logo</label>
                      <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-6 text-center hover:border-[#C96A2B] transition-colors">
                        <Upload className="w-8 h-8 text-[#9CA3AF] mx-auto mb-2" />
                        <p className="text-sm text-[#4B5563]">
                          Email your logo to <a href="mailto:hello@getpipelineai.com" className="text-[#C96A2B] hover:underline">hello@getpipelineai.com</a>
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-1">PNG or SVG preferred</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-[#081F33] mb-2">Additional Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                    placeholder="Any specific requests or details about your business..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#C96A2B] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#B55D24] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Continue to Payment</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
              <h2 className="text-lg font-semibold text-[#081F33] mb-4">Order Summary</h2>
              
              <div className="border-b border-[#E5E7EB] pb-4 mb-4">
                <div className="font-medium text-[#081F33]">{product.title}</div>
                <div className="text-sm text-[#4B5563]">{product.category}</div>
                {product.description && (
                  <p className="text-sm text-[#4B5563] mt-2">{product.description}</p>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#4B5563]">Type</span>
                  <span className="text-[#081F33] capitalize">{product.product_type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4B5563]">Items</span>
                  <span className="text-[#081F33]">{product.items_count}</span>
                </div>
              </div>
              
              <div className="border-t border-[#E5E7EB] pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#081F33]">Total</span>
                  <div className="text-right">
                    {product.sale_price && product.sale_price < product.price ? (
                      <>
                        <span className="text-sm text-[#9CA3AF] line-through mr-2">${product.price}</span>
                        <span className="text-2xl font-bold text-[#C96A2B]">${product.sale_price}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-[#C96A2B]">${product.price}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#F8F3EA] rounded-lg">
                <p className="text-xs text-[#4B5563]">
                  <strong>What happens next?</strong><br />
                  After payment, we&apos;ll review your info and deliver your custom content within 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F3EA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C96A2B]" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}
