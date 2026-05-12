'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Download, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

interface DownloadItem {
  id?: string;
  title: string;
  category: string;
  content_type: string;
  download_files: string[];
}

interface DownloadData {
  success: boolean;
  isCart?: boolean;
  item?: DownloadItem;
  items?: DownloadItem[];
  customer_email?: string;
  error?: string;
}

function DownloadContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [data, setData] = useState<DownloadData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setData({ success: false, error: 'No session ID provided' });
      setLoading(false);
      return;
    }

    async function verifyAndFetch() {
      try {
        const res = await fetch(`/api/download?session_id=${sessionId}`);
        const result = await res.json();
        setData(result);
      } catch {
        setData({ success: false, error: 'Failed to verify purchase' });
      }
      setLoading(false);
    }

    verifyAndFetch();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081F33] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C96A2B] animate-spin mx-auto mb-4" />
          <p className="text-white/70">Verifying your purchase...</p>
        </div>
      </div>
    );
  }

  if (!data?.success) {
    return (
      <div className="min-h-screen bg-[#081F33] flex items-center justify-center p-6">
        <div className="bg-white/5 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Download Unavailable</h1>
          <p className="text-white/60 mb-6">{data?.error || 'Unable to verify your purchase.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#C96A2B] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Get all items (either single or cart)
  const allItems: DownloadItem[] = data.isCart && data.items ? data.items : (data.item ? [data.item] : []);

  return (
    <div className="min-h-screen bg-[#081F33]">
      <header className="bg-[#081F33] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Pipeline <span className="text-[#C96A2B]">AI</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Thank You for Your Purchase!
          </h1>
          <p className="text-white/60 text-lg">
            Your download is ready. A confirmation has been sent to{' '}
            <span className="text-white">{data.customer_email}</span>
          </p>
        </div>

        {allItems.map((item, itemIndex) => (
          <div key={item.id || itemIndex} className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-6">
            <div className="mb-6">
              <span className="text-xs font-semibold text-[#C96A2B] uppercase">{item.category}</span>
              <h2 className="text-2xl font-bold text-white mt-1">{item.title}</h2>
              <p className="text-white/50 text-sm mt-1">
                {item.content_type === 'carousel' 
                  ? `${item.download_files?.length || 0} files included`
                  : item.content_type}
              </p>
            </div>

            {item.download_files && item.download_files.length > 0 ? (
              <div className="space-y-3">
                <p className="text-white/70 text-sm mb-4">Click to download your files:</p>
                {item.download_files.map((url, index) => {
                  const fileName = `${item.title?.replace(/[^a-z0-9]/gi, '-')}-${index + 1}.${url.split('.').pop()}`;
                  return (
                    <button
                      key={index}
                      onClick={async () => {
                        try {
                          const response = await fetch(url);
                          const blob = await response.blob();
                          const blobUrl = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = blobUrl;
                          a.download = fileName;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          window.URL.revokeObjectURL(blobUrl);
                        } catch {
                          window.open(url, '_blank');
                        }
                      }}
                      className="w-full flex items-center justify-between bg-[#C96A2B]/10 hover:bg-[#C96A2B]/20 border border-[#C96A2B]/30 rounded-xl px-5 py-4 transition-all group"
                    >
                      <span className="text-white font-medium">
                        {item.content_type === 'carousel' 
                          ? `Slide ${index + 1}` 
                          : `Download ${index + 1}`}
                      </span>
                      <Download className="w-5 h-5 text-[#C96A2B] group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  );
                })}
                
                {item.download_files.length > 1 && (
                  <div className="pt-4 border-t border-white/10 mt-6">
                    <button
                      onClick={async () => {
                        for (let i = 0; i < (item.download_files?.length || 0); i++) {
                          const url = item.download_files?.[i];
                          if (!url) continue;
                          const fileName = `${item.title?.replace(/[^a-z0-9]/gi, '-')}-${i + 1}.${url.split('.').pop()}`;
                          try {
                            const response = await fetch(url);
                            const blob = await response.blob();
                            const blobUrl = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = blobUrl;
                            a.download = fileName;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(blobUrl);
                            await new Promise(resolve => setTimeout(resolve, 500));
                          } catch {
                            window.open(url, '_blank');
                          }
                        }
                      }}
                      className="w-full bg-[#C96A2B] hover:bg-[#B55D24] text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Download All Files
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-white/50">
                <p>Download files are being prepared. Please check back shortly or contact support.</p>
              </div>
            )}
          </div>
        ))}

        <div className="text-center mt-8">
          <p className="text-white/40 text-sm mb-4">
            Bookmark this page to access your downloads anytime.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#C96A2B] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse More Content
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#081F33] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#C96A2B] animate-spin" />
      </div>
    }>
      <DownloadContent />
    </Suspense>
  );
}
