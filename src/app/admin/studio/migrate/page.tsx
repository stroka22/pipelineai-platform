'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Database, Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface MigrationStatus {
  total: number;
  processed: number;
  success: number;
  failed: number;
  current: string;
}

export default function MigratePage() {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  async function startMigration() {
    setRunning(true);
    setLogs([]);
    
    // Get all images that have base64 data (not URLs)
    const { data: images, error } = await supabase
      .from('generated_images')
      .select('id, title, image_url')
      .not('image_url', 'like', 'https://%')
      .limit(500);

    if (error || !images) {
      setLogs(prev => [...prev, `Error fetching images: ${error?.message}`]);
      setRunning(false);
      return;
    }

    const base64Images = images.filter(img => 
      img.image_url?.startsWith('data:') || 
      (img.image_url && !img.image_url.startsWith('http'))
    );

    setLogs(prev => [...prev, `Found ${base64Images.length} images to migrate`]);
    
    setStatus({
      total: base64Images.length,
      processed: 0,
      success: 0,
      failed: 0,
      current: ''
    });

    for (let i = 0; i < base64Images.length; i++) {
      const img = base64Images[i];
      setStatus(prev => prev ? { ...prev, current: img.title || img.id, processed: i } : null);

      try {
        // Convert base64 to blob
        let base64Data = img.image_url;
        if (base64Data.startsWith('data:')) {
          base64Data = base64Data.split(',')[1];
        }

        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let j = 0; j < byteCharacters.length; j++) {
          byteNumbers[j] = byteCharacters.charCodeAt(j);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });

        // Upload to storage
        const fileName = `migrated/${img.id}.png`;
        const { error: uploadError } = await supabase.storage
          .from('generated-images')
          .upload(fileName, blob, {
            contentType: 'image/png',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('generated-images')
          .getPublicUrl(fileName);

        // Update database record
        const { error: updateError } = await supabase
          .from('generated_images')
          .update({ image_url: publicUrlData.publicUrl })
          .eq('id', img.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        setStatus(prev => prev ? { ...prev, success: prev.success + 1 } : null);
        setLogs(prev => [...prev, `✓ Migrated: ${img.title || img.id}`]);
      } catch (err: any) {
        setStatus(prev => prev ? { ...prev, failed: prev.failed + 1 } : null);
        setLogs(prev => [...prev, `✗ Failed: ${img.title || img.id} - ${err.message}`]);
      }
    }

    setStatus(prev => prev ? { ...prev, processed: base64Images.length, current: 'Complete!' } : null);
    setRunning(false);
    setLogs(prev => [...prev, '--- Migration complete ---']);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/admin/studio/library" 
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <Database className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Migrate Images to Storage</h1>
            <p className="text-white/60">Move base64 images from database to Supabase Storage</p>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">What this does:</h2>
          <ul className="space-y-2 text-white/70">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              Finds all images stored as base64 in the database
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              Uploads each image to Supabase Storage
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              Updates the database with the new URL
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              Reduces database size and enables fast library loading
            </li>
          </ul>
        </div>

        {!running && !status && (
          <button
            onClick={startMigration}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Upload className="w-5 h-5" />
            Start Migration
          </button>
        )}

        {status && (
          <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Migration Progress</h2>
              {running && <Loader2 className="w-5 h-5 animate-spin text-purple-400" />}
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{status.total}</div>
                <div className="text-white/60 text-sm">Total</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{status.processed}</div>
                <div className="text-white/60 text-sm">Processed</div>
              </div>
              <div className="bg-green-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{status.success}</div>
                <div className="text-white/60 text-sm">Success</div>
              </div>
              <div className="bg-red-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{status.failed}</div>
                <div className="text-white/60 text-sm">Failed</div>
              </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-3 mb-2">
              <div 
                className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(status.processed / status.total) * 100}%` }}
              />
            </div>
            <p className="text-white/60 text-sm">Current: {status.current}</p>
          </div>
        )}

        {logs.length > 0 && (
          <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Migration Log</h2>
            <div className="bg-black/50 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
              {logs.map((log, i) => (
                <div 
                  key={i} 
                  className={`${
                    log.startsWith('✓') ? 'text-green-400' : 
                    log.startsWith('✗') ? 'text-red-400' : 
                    'text-white/70'
                  }`}
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
