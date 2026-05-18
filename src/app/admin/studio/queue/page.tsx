'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Layers,
  Play
} from 'lucide-react';

interface QueueItem {
  id: string;
  title: string;
  niche: string;
  category: string;
  style: string;
  slide_count: number;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  progress: number;
  current_slide: number;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export default function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState({ pending: 0, processing: 0, complete: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchQueue() {
    try {
      const response = await fetch('/api/queue');
      const data = await response.json();
      setItems(data.items || []);
      setStats(data.stats || { pending: 0, processing: 0, complete: 0, failed: 0 });
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this queue item?')) return;
    
    try {
      await fetch(`/api/queue?id=${id}`, { method: 'DELETE' });
      setItems(items.filter(i => i.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  }

  async function triggerProcessing() {
    try {
      setRefreshing(true);
      await fetch('/api/cron/process-queue');
      setTimeout(fetchQueue, 2000);
    } catch (error) {
      console.error('Failed to trigger:', error);
      setRefreshing(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400';
      case 'complete':
        return 'bg-green-500/20 text-green-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  }

  function formatTime(dateString: string | null) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/studio" 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Carousel Queue</h1>
              <p className="text-white/60">Background carousel generation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setRefreshing(true); fetchQueue(); }}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {stats.pending > 0 && (
              <button
                onClick={triggerProcessing}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Process Now
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-white/60 text-sm">Pending</div>
              </div>
            </div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Loader2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.processing}</div>
                <div className="text-white/60 text-sm">Processing</div>
              </div>
            </div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.complete}</div>
                <div className="text-white/60 text-sm">Complete</div>
              </div>
            </div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.failed}</div>
                <div className="text-white/60 text-sm">Failed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Items */}
        {items.length === 0 ? (
          <div className="bg-[#111111] border border-white/10 rounded-xl p-12 text-center">
            <Layers className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Queue is Empty</h2>
            <p className="text-white/60 mb-6">Add carousels to the queue from the Carousel Creator</p>
            <Link
              href="/admin/studio/carousel"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Layers className="w-5 h-5" />
              Create Carousel
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="bg-[#111111] border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(item.status)}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {item.title || `${item.niche} - ${item.category}`}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {item.niche} • {item.category} • {item.slide_count} slides • {item.style}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                        <span>Created: {formatTime(item.created_at)}</span>
                        {item.started_at && <span>Started: {formatTime(item.started_at)}</span>}
                        {item.completed_at && <span>Completed: {formatTime(item.completed_at)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    {item.status !== 'processing' && (
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar for processing items */}
                {item.status === 'processing' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                      <span>Generating slide {item.current_slide} of {item.slide_count}</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error message */}
                {item.error_message && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                    {item.error_message}
                  </div>
                )}

                {/* Complete message */}
                {item.status === 'complete' && (
                  <div className="mt-4">
                    <Link
                      href="/admin/studio/library"
                      className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      View in Library →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="mt-8 bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
          <h3 className="font-semibold text-purple-400 mb-2">How the Queue Works</h3>
          <ul className="text-white/60 text-sm space-y-1">
            <li>• Carousels are processed automatically every 5 minutes</li>
            <li>• One carousel is processed at a time to ensure quality</li>
            <li>• Generated images appear in your Library when complete</li>
            <li>• Click &quot;Process Now&quot; to immediately start the next item</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
