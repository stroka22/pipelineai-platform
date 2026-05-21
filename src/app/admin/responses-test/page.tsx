'use client';

import { useState } from 'react';
import { X, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ImageInput {
  url: string;
  label: string;
  preview: string;
}

export default function ResponsesTestPage() {
  const [images, setImages] = useState<ImageInput[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(reader.result as string); return; }

          const maxW = 512;
          let w = img.width, h = img.height;
          if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }

          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = () => resolve(reader.result as string);
        img.src = reader.result as string;
      };
      reader.onerror = () => reject('File read failed');
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const compressed = await compressImage(file);
        setImages(prev => [...prev, { url: compressed, label: file.name, preview: compressed }]);
      } catch (err) {
        console.error('Failed:', err);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const runTest = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/carousel/responses-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Request failed');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Responses API Test</h1>
        <p className="text-gray-400 mb-8">
          Upload multiple images and describe what you want. Like ChatGPT.
        </p>

        {/* Plain visible file input - simplest possible approach */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Images</h2>

          <div className="mb-4">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="block w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
            />
          </div>

          {/* Previews */}
          {images.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">{images.length} image{images.length !== 1 ? 's' : ''}</span>
                <button
                  type="button"
                  onClick={() => setImages([])}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Clear all
                </button>
              </div>
              <div className="flex gap-3 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={img.preview}
                      alt={img.label}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="text-xs text-gray-500 block mt-1 truncate w-24">
                      {img.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Prompt */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">What do you want?</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want generated... e.g., 'Put this person in front of this house with this logo in the corner'"
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Generate */}
        <button
          type="button"
          onClick={runTest}
          disabled={loading || images.length === 0}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-blue-500 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-900/50 border border-red-500 rounded-xl p-4">
            <p className="text-sm text-red-300 whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 bg-gray-900 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Result
            </h2>

            {result.generatedImage && (
              <div className="mb-4">
                <img
                  src={`data:image/png;base64,${result.generatedImage}`}
                  alt="Generated"
                  className="max-w-full rounded-lg"
                />
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer text-gray-400 hover:text-white">
                View Raw Response
              </summary>
              <pre className="mt-2 bg-gray-800 p-4 rounded-lg text-xs overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
