'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Upload, Loader2, CheckCircle, Package } from 'lucide-react';

export default function ImportPage() {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ imported: number; skipped: number } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  async function importVaultImages() {
    setImporting(true);
    setLogs([]);
    setResults(null);

    try {
      // Get all vault items
      const { data: vaultItems, error } = await supabase
        .from('vault_items')
        .select('*');

      if (error) throw error;

      setLogs(prev => [...prev, `Found ${vaultItems?.length || 0} vault items`]);

      let imported = 0;
      let skipped = 0;

      for (const item of vaultItems || []) {
        // Check each image in the vault item
        for (let i = 0; i < (item.images?.length || 0); i++) {
          const imageUrl = item.images[i];
          
          // Check if this image already exists in library
          const { data: existing } = await supabase
            .from('generated_images')
            .select('id')
            .eq('image_url', imageUrl)
            .single();

          if (existing) {
            skipped++;
            continue;
          }

          // Import to library
          const { error: insertError } = await supabase
            .from('generated_images')
            .insert({
              title: item.images.length > 1 
                ? `${item.title} - Slide ${i + 1}` 
                : item.title,
              image_url: imageUrl,
              niche: item.niche || 'General',
              style: 'imported',
              content_type: item.content_type || 'carousel',
              prompt_used: `Imported from vault: ${item.title}`,
            });

          if (insertError) {
            setLogs(prev => [...prev, `Failed: ${item.title} - ${insertError.message}`]);
          } else {
            imported++;
            setLogs(prev => [...prev, `✓ Imported: ${item.title}${item.images.length > 1 ? ` (Slide ${i + 1})` : ''}`]);
          }
        }
      }

      setResults({ imported, skipped });
      setLogs(prev => [...prev, `--- Complete: ${imported} imported, ${skipped} already existed ---`]);
    } catch (err: any) {
      setLogs(prev => [...prev, `Error: ${err.message}`]);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/admin/studio/library" 
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-[#C96A2B]/20 rounded-xl">
            <Package className="w-8 h-8 text-[#C96A2B]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Import Vault Images</h1>
            <p className="text-white/60">Add existing vault images to the library</p>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-6">
          <p className="text-white/70 mb-4">
            This will scan all vault items and import their images into the library. 
            Images that already exist in the library will be skipped.
          </p>
          
          <button
            onClick={importVaultImages}
            disabled={importing}
            className="flex items-center gap-2 bg-[#C96A2B] hover:bg-[#C96A2B]/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {importing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Import Vault Images
              </>
            )}
          </button>
        </div>

        {results && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-green-400 font-semibold">Import Complete</p>
                <p className="text-white/60 text-sm">
                  {results.imported} imported, {results.skipped} already existed
                </p>
              </div>
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Import Log</h3>
            <div className="bg-black/50 rounded-lg p-4 max-h-80 overflow-y-auto font-mono text-sm space-y-1">
              {logs.map((log, i) => (
                <div 
                  key={i} 
                  className={log.startsWith('✓') ? 'text-green-400' : log.startsWith('Failed') || log.startsWith('Error') ? 'text-red-400' : 'text-white/60'}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
