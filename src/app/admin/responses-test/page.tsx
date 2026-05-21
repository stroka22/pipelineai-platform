'use client';

import { useState } from 'react';
import { Upload, X, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, label: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImages(prev => [...prev, { url: base64, label, preview: base64 }]);
    };
    reader.readAsDataURL(file);
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
          Test if the new OpenAI Responses API can preserve likeness of multiple input images
        </p>

        {/* Image Upload Section */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Reference Images</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Headshot Upload */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Headshot</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                <Upload className="w-8 h-8 text-gray-500" />
                <span className="text-sm text-gray-500 mt-2">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'headshot - person photo')}
                />
              </label>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Logo</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                <Upload className="w-8 h-8 text-gray-500" />
                <span className="text-sm text-gray-500 mt-2">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'company logo')}
                />
              </label>
            </div>

            {/* Location/House Upload */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Location/House</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                <Upload className="w-8 h-8 text-gray-500" />
                <span className="text-sm text-gray-500 mt-2">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'location/building photo')}
                />
              </label>
            </div>
          </div>

          {/* Uploaded Images Preview */}
          {images.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm text-gray-400 mb-2">Uploaded ({images.length})</h3>
              <div className="flex gap-3 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={img.preview}
                      alt={img.label}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="text-xs text-gray-400 block mt-1 truncate w-24">
                      {img.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Prompt Section */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Generation Prompt</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe how you want the images combined... e.g., 'Show this real estate agent standing in front of this house, with their company logo visible in the corner'"
            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={runTest}
          disabled={loading || images.length === 0}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-blue-500 transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Testing Responses API...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Test Multi-Image Generation
            </>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-900/50 border border-red-500 rounded-xl p-4">
            <h3 className="font-semibold text-red-400 mb-2">Error</h3>
            <pre className="text-sm text-red-300 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {/* Result Display */}
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
