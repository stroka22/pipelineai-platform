'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase, Product } from '@/lib/supabase';
import { Download, CheckCircle, ArrowLeft, FileIcon, AlertTriangle } from 'lucide-react';

export default function DownloadPage() {
  const params = useParams();
  const productId = params.productId as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  async function fetchProduct() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error || !data) {
      setError('Product not found');
    } else {
      setProduct(data);
    }
    setLoading(false);
  }

  function getFileName(url: string) {
    const name = url.split('/').pop() || 'file';
    // Remove timestamp prefix if present
    return name.replace(/^\d+-\d+-/, '');
  }

  function getFileExtension(url: string) {
    const ext = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'Image';
    if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) return 'Video';
    if (ext === 'pdf') return 'PDF';
    if (ext === 'zip') return 'ZIP Archive';
    return 'File';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#081F33] to-[#0d2d4a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C96A2B]"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#081F33] to-[#0d2d4a] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-[#C96A2B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Product Not Found</h1>
          <p className="text-white/60 mb-6">This download link may have expired or is invalid.</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#B55D24] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#081F33] to-[#0d2d4a] py-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Thank You for Your Purchase!</h1>
          <p className="text-white/60">Your content is ready to download</p>
        </div>

        {/* Product Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-2">{product.title}</h2>
          <p className="text-white/60 text-sm mb-6">{product.description}</p>
          
          {/* Download Files */}
          {product.download_files && product.download_files.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/80 mb-4">
                {product.download_files.length} file{product.download_files.length > 1 ? 's' : ''} included:
              </p>
              {product.download_files.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  download
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#C96A2B]/20 rounded-xl flex items-center justify-center">
                      <FileIcon className="w-6 h-6 text-[#C96A2B]" />
                    </div>
                    <div>
                      <p className="font-medium text-white group-hover:text-[#C96A2B] transition-colors">
                        {getFileName(url)}
                      </p>
                      <p className="text-xs text-white/50">{getFileExtension(url)}</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-white/50 group-hover:text-[#C96A2B] transition-colors" />
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/50">
              <p>No download files available yet.</p>
              <p className="text-sm mt-2">Please contact support if you believe this is an error.</p>
            </div>
          )}
        </div>

        {/* Download All Button */}
        {product.download_files && product.download_files.length > 1 && (
          <div className="text-center mb-8">
            <button
              onClick={() => {
                product.download_files?.forEach((url, index) => {
                  setTimeout(() => {
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = getFileName(url);
                    link.click();
                  }, index * 500);
                });
              }}
              className="inline-flex items-center gap-2 bg-[#C96A2B] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#B55D24] transition-all"
            >
              <Download className="w-6 h-6" />
              Download All Files
            </button>
          </div>
        )}

        {/* Terms Reminder */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <h3 className="font-semibold text-yellow-500 mb-2">License Terms</h3>
          <p className="text-white/60 text-sm">
            This content is licensed for single-business use only. Reselling, redistribution, 
            or sharing these files is strictly prohibited and may result in legal action.
          </p>
        </div>

        {/* Back to Store */}
        <div className="text-center mt-8">
          <Link 
            href="/industries/pest-control"
            className="text-white/60 hover:text-[#C96A2B] transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse more content
          </Link>
        </div>
      </div>
    </div>
  );
}
