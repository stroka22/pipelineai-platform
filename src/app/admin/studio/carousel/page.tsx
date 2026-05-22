'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadImageFromUrl } from '@/lib/storage';
import Link from 'next/link';
import { 
  ArrowLeft,
  Layers,
  Plus,
  Loader2,
  Sparkles,
  RefreshCw,
  Download,
  Save,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Building2,
  GripVertical,
  Wand2,
  MessageSquare,
  Upload,
  X,
  Eye,
  ShoppingBag,
  DollarSign,
  Clock
} from 'lucide-react';


const CAROUSEL_CATEGORIES = [
  { id: 'myths_reality', name: 'Myths vs Reality', description: 'Debunk common misconceptions' },
  { id: 'mistakes', name: 'Common Mistakes', description: 'What to avoid' },
  { id: 'tips', name: 'Pro Tips', description: 'Expert advice' },
  { id: 'process', name: 'Process Explainer', description: 'Step-by-step guide' },
  { id: 'educational', name: 'Educational', description: 'Teach your audience' },
  { id: 'transformation', name: 'Transformation', description: 'Before & after stories' },
  { id: 'statistics', name: 'Statistics', description: 'Data-driven content' },
  { id: 'faq', name: 'FAQ', description: 'Answer common questions' },
  { id: 'authority', name: 'Authority Building', description: 'Establish expertise' },
  { id: 'lead_gen', name: 'Lead Generation', description: 'Drive conversions' },
];

const SLIDE_COUNTS = [5, 7, 10];

// Fallback list if database niches not loaded
const DEFAULT_NICHES = [
  'Roofing', 'HVAC', 'Plumbing', 'Pest Control', 'Med Spa', 'Dental', 'Chiropractic',
  'Real Estate', 'Mortgage', 'Insurance', 'Law Firm', 'Auto Repair', 'Landscaping',
  'Gym/Fitness', 'Salon', 'Restaurant', 'Church', 'Financial Planning', 'General'
];

interface Slide {
  id: string;
  slideNumber: number;
  headline: string;
  bodyText: string;
  imageUrl: string | null;
  status: 'pending' | 'generating' | 'complete' | 'error';
}

export default function CarouselCreatorPage() {
  const [mode, setMode] = useState<'form' | 'prompt'>('form');
  const [step, setStep] = useState<'setup' | 'generate' | 'review'>('setup');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Open prompt mode
  const [openPrompt, setOpenPrompt] = useState('');
  const [promptSlideCount, setPromptSlideCount] = useState(5);
  
  // Reference image
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceAnalysis, setReferenceAnalysis] = useState<string | null>(null);
  
  // Brands
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  
  // Setup
  const [carouselConfig, setCarouselConfig] = useState({
    title: '',
    category: 'tips',
    slideCount: 5,
    niche: 'General',
    businessName: '',
    topic: '',
    style: 'modern',
    primaryColor: '#C96A2B',
    secondaryColor: '#081F33',
  });
  
  // Slides
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [generatingSlideIndex, setGeneratingSlideIndex] = useState<number | null>(null);
  
  // Add to Vault
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [vaultForm, setVaultForm] = useState({
    price: '5.00',
    caption: '',
    category: '',
    niche: '',
  });
  const [niches, setNiches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [addingToVault, setAddingToVault] = useState(false);
  
  // Queue
  const [addingToQueue, setAddingToQueue] = useState(false);

  useEffect(() => {
    loadBrands();
    loadNichesAndCategories();
  }, []);

  async function loadNichesAndCategories() {
    const [nichesRes, catsRes] = await Promise.all([
      supabase.from('niches').select('*').order('name'),
      supabase.from('categories').select('*').order('name'),
    ]);
    if (nichesRes.data) setNiches(nichesRes.data);
    if (catsRes.data) setCategories(catsRes.data);
  }

  async function loadBrands() {
    const { data } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('is_archived', false);
    
    setBrands(data || []);
  }

  function handleReferenceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setReferenceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function clearReference() {
    setReferenceImage(null);
    setReferenceAnalysis(null);
  }

  function applyBrand(brandId: string) {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      setCarouselConfig(prev => ({
        ...prev,
        businessName: brand.business_name,
        niche: brand.niche || prev.niche,
        primaryColor: brand.primary_color || prev.primaryColor,
        secondaryColor: brand.secondary_color || prev.secondaryColor,
      }));
    }
    setSelectedBrand(brandId);
  }

  async function initializeSlides() {
    const count = mode === 'prompt' ? promptSlideCount : carouselConfig.slideCount;
    const newSlides: Slide[] = [];
    for (let i = 0; i < count; i++) {
      newSlides.push({
        id: `slide-${i}`,
        slideNumber: i + 1,
        headline: '',
        bodyText: '',
        imageUrl: null,
        status: 'pending',
      });
    }
    setSlides(newSlides);
    
    // Analyze reference image if provided
    if (referenceImage && !referenceAnalysis) {
      setLoading(true);
      try {
        const response = await fetch('/api/studio/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: referenceImage }),
        });
        const data = await response.json();
        if (data.success && data.analysis) {
          setReferenceAnalysis(data.analysis);
        }
      } catch (error) {
        console.error('Failed to analyze reference:', error);
      }
      setLoading(false);
    }
    
    setStep('generate');
  }

  async function generateAllSlidesFromPrompt() {
    setLoading(true);
    
    for (let i = 0; i < slides.length; i++) {
      setGeneratingSlideIndex(i);
      setActiveSlideIndex(i);
      
      setSlides(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'generating' } : s
      ));
      
      try {
        const slidePosition = i === 0 ? 'opening hook slide that grabs attention' : 
                             i === slides.length - 1 ? 'closing CTA slide with strong call-to-action' :
                             `slide ${i + 1} of ${slides.length} (middle content slide)`;
        
        let prompt = `${openPrompt}

This is ${slidePosition} in a ${slides.length}-slide carousel.

Requirements:
- Create a visually distinct slide that fits this position in the carousel narrative
- Maintain visual consistency with the overall carousel theme
- Optimize for Instagram/social media square format (1:1)
- Include readable, well-positioned text
- Make it premium and professional
${i === 0 ? '- This is the HOOK - make it attention-grabbing and make people want to swipe' : ''}
${i === slides.length - 1 ? '- This is the CLOSING - include a compelling call-to-action' : ''}`;

        // Add reference style if available
        if (referenceAnalysis) {
          prompt = `REFERENCE STYLE TO MATCH:
${referenceAnalysis}

${prompt}

Match the visual style, colors, and aesthetic of the reference image while creating this carousel slide.`;
        }

        const response = await fetch('/api/studio/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, size: '1024x1024' }),
        });
        
        const data = await response.json();
        
        if (data.success && data.imageUrl) {
          // Upload to storage and save to library (open prompt mode)
          const carouselTitle = carouselConfig.title || 'Open Prompt Carousel';
          const { url: storageUrl } = await uploadImageFromUrl(
            data.imageUrl,
            'carousels',
            `open-prompt-${Date.now()}-slide-${i + 1}.png`
          );
          
          await supabase.from('generated_images').insert({
            title: `${carouselTitle} - Slide ${i + 1}`,
            image_url: storageUrl,
            prompt_used: prompt,
            niche: carouselConfig.niche || 'General',
            style: carouselConfig.style || 'custom',
            content_type: 'carousel',
          });
          
          setSlides(prev => prev.map((s, idx) => 
            idx === i ? { ...s, imageUrl: storageUrl, status: 'complete' } : s
          ));
        } else {
          setSlides(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: 'error' } : s
          ));
        }
      } catch (error) {
        console.error(`Error generating slide ${i + 1}:`, error);
        setSlides(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'error' } : s
        ));
      }
    }
    
    setGeneratingSlideIndex(null);
    setLoading(false);
    setStep('review');
  }

  async function generateAllSlides() {
    setLoading(true);
    
    const category = CAROUSEL_CATEGORIES.find(c => c.id === carouselConfig.category);
    
    for (let i = 0; i < slides.length; i++) {
      setGeneratingSlideIndex(i);
      setActiveSlideIndex(i);
      
      // Update status
      setSlides(prev => prev.map((s, idx) => 
        idx === i ? { ...s, status: 'generating' } : s
      ));
      
      try {
        // Build prompt for this slide
        const slidePosition = i === 0 ? 'opening hook slide' : 
                             i === slides.length - 1 ? 'closing CTA slide' :
                             `slide ${i + 1} of ${slides.length}`;
        
        let prompt = `Create a premium ${carouselConfig.style} style carousel slide for a ${carouselConfig.niche.toLowerCase()} business.

This is ${slidePosition} in a ${carouselConfig.slideCount}-slide ${category?.name} carousel.
${carouselConfig.businessName ? `Business: "${carouselConfig.businessName}"` : ''}
Topic: ${carouselConfig.topic || category?.description}

${i === 0 ? 'This is the HOOK slide - it should grab attention and make people want to swipe.' : ''}
${i === slides.length - 1 ? 'This is the CLOSING slide - include a strong call-to-action.' : ''}

Color scheme: primary ${carouselConfig.primaryColor}, secondary ${carouselConfig.secondaryColor}.
The slide should be visually distinct from other slides while maintaining brand consistency.
Include readable text that fits the slide position in the carousel narrative.
Optimize for Instagram/social media square format.`;

        // Add reference style if available
        if (referenceAnalysis) {
          prompt = `REFERENCE STYLE TO MATCH:
${referenceAnalysis}

${prompt}

Match the visual style, colors, and aesthetic of the reference image while creating this carousel slide.`;
        }

        const response = await fetch('/api/studio/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, size: '1024x1024' }),
        });
        
        const data = await response.json();
        
        if (data.success && data.imageUrl) {
          // Upload to storage and save to library (category mode)
          const carouselTitle = carouselConfig.title || `${carouselConfig.niche} Carousel`;
          const { url: storageUrl } = await uploadImageFromUrl(
            data.imageUrl,
            'carousels',
            `${carouselConfig.niche.toLowerCase()}-${Date.now()}-slide-${i + 1}.png`
          );
          
          await supabase.from('generated_images').insert({
            title: `${carouselTitle} - Slide ${i + 1}`,
            image_url: storageUrl,
            prompt_used: prompt,
            niche: carouselConfig.niche,
            style: carouselConfig.style,
            content_type: 'carousel',
          });
          
          setSlides(prev => prev.map((s, idx) => 
            idx === i ? { ...s, imageUrl: storageUrl, status: 'complete' } : s
          ));
        } else {
          setSlides(prev => prev.map((s, idx) => 
            idx === i ? { ...s, status: 'error' } : s
          ));
        }
      } catch (error) {
        console.error(`Error generating slide ${i + 1}:`, error);
        setSlides(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'error' } : s
        ));
      }
    }
    
    setGeneratingSlideIndex(null);
    setLoading(false);
    setStep('review');
  }

  async function regenerateSlide(index: number) {
    setGeneratingSlideIndex(index);
    setSlides(prev => prev.map((s, idx) => 
      idx === index ? { ...s, status: 'generating' } : s
    ));
    
    const category = CAROUSEL_CATEGORIES.find(c => c.id === carouselConfig.category);
    const slidePosition = index === 0 ? 'opening hook slide' : 
                         index === slides.length - 1 ? 'closing CTA slide' :
                         `slide ${index + 1} of ${slides.length}`;
    
    let prompt: string;
    
    // If using custom prompt mode, use the original prompt
    if (mode === 'prompt' && openPrompt) {
      prompt = `${openPrompt}

This is ${slidePosition} in a ${promptSlideCount}-slide carousel.
${index === 0 ? 'This is the HOOK slide - grab attention and make people want to swipe.' : ''}
${index === slides.length - 1 ? 'This is the CLOSING slide - include a strong call-to-action.' : ''}

Create a DIFFERENT visual composition than the previous version while maintaining the same style and theme.
Optimize for Instagram/social media square format (1:1 aspect ratio).`;
    } else {
      // Form mode - build prompt from config
      prompt = `Create a premium ${carouselConfig.style} style carousel slide for a ${carouselConfig.niche.toUpperCase()} business.

INDUSTRY: ${carouselConfig.niche.toUpperCase()} - All visuals and text MUST be specific to this industry.
This is ${slidePosition} in a ${carouselConfig.slideCount}-slide ${category?.name} carousel.
${carouselConfig.businessName ? `Business Name: "${carouselConfig.businessName}"` : ''}
Topic: ${carouselConfig.topic || category?.description}

${index === 0 ? 'This is the HOOK slide - grab attention and make people want to swipe.' : ''}
${index === slides.length - 1 ? 'This is the CLOSING slide - include a strong call-to-action.' : ''}

REQUIRED COLOR SCHEME (must follow exactly):
- Primary/Accent Color: ${carouselConfig.primaryColor}
- Background/Secondary Color: ${carouselConfig.secondaryColor}
Use these exact colors throughout the design.

Create a DIFFERENT visual composition than the previous version while maintaining brand consistency.
Optimize for Instagram/social media square format (1:1 aspect ratio).

IMPORTANT: This is for a ${carouselConfig.niche} business. Do NOT create content for any other industry.`;
    }
    
    // Add reference analysis if available
    if (referenceAnalysis) {
      prompt = `REFERENCE STYLE TO MATCH:\n${referenceAnalysis}\n\n${prompt}\n\nMatch the visual style, colors, and aesthetic of the reference image.`;
    }

    try {
      const response = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, size: '1024x1024' }),
      });
      
      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        // Upload to storage and save to library (regenerated slide)
        const carouselTitle = carouselConfig.title || `${carouselConfig.niche} Carousel`;
        const { url: storageUrl } = await uploadImageFromUrl(
          data.imageUrl,
          'carousels',
          `${carouselConfig.niche.toLowerCase()}-${Date.now()}-slide-${index + 1}-regen.png`
        );
        
        await supabase.from('generated_images').insert({
          title: `${carouselTitle} - Slide ${index + 1} (regenerated)`,
          image_url: storageUrl,
          prompt_used: prompt,
          niche: carouselConfig.niche,
          style: carouselConfig.style,
          content_type: 'carousel',
        });
        
        setSlides(prev => prev.map((s, idx) => 
          idx === index ? { ...s, imageUrl: storageUrl, status: 'complete' } : s
        ));
      } else {
        setSlides(prev => prev.map((s, idx) => 
          idx === index ? { ...s, status: 'error' } : s
        ));
      }
    } catch {
      setSlides(prev => prev.map((s, idx) => 
        idx === index ? { ...s, status: 'error' } : s
      ));
    }
    
    setGeneratingSlideIndex(null);
  }

  async function saveCarousel() {
    setSaving(true);
    
    try {
      // Create carousel project
      const { data: carousel, error: carouselError } = await supabase
        .from('carousel_projects')
        .insert({
          title: carouselConfig.title || `${carouselConfig.niche} - ${CAROUSEL_CATEGORIES.find(c => c.id === carouselConfig.category)?.name}`,
          brand_profile_id: selectedBrand || null,
          slide_count: carouselConfig.slideCount,
          category: carouselConfig.category,
          niche: carouselConfig.niche,
          style_preset: carouselConfig.style,
          status: 'complete',
        })
        .select()
        .single();
      
      if (carouselError) throw carouselError;
      
      // Create slides (images already saved during generation)
      for (const slide of slides) {
        if (slide.imageUrl) {
          // Create slide record - image was already saved to generated_images during generation
          await supabase
            .from('carousel_slides')
            .insert({
              carousel_project_id: carousel.id,
              slide_number: slide.slideNumber,
              headline: slide.headline,
              body_text: slide.bodyText,
              image_url: slide.imageUrl,
              status: 'complete',
            });
        }
      }
      
      alert('Carousel saved to library!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save carousel');
    } finally {
      setSaving(false);
    }
  }

  async function addToQueue() {
    setAddingToQueue(true);
    
    try {
      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: carouselConfig.title,
          niche: carouselConfig.niche,
          category: carouselConfig.category,
          style: carouselConfig.style,
          slideCount: mode === 'prompt' ? promptSlideCount : carouselConfig.slideCount,
          topic: carouselConfig.topic,
          businessName: carouselConfig.businessName,
          primaryColor: carouselConfig.primaryColor,
          secondaryColor: carouselConfig.secondaryColor,
          referenceAnalysis: referenceAnalysis,
          openPrompt: mode === 'prompt' ? openPrompt : null,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Added to queue! Your carousel will be generated automatically. Check the Queue page for status.');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Queue error:', error);
      alert('Failed to add to queue: ' + error.message);
    } finally {
      setAddingToQueue(false);
    }
  }

  async function downloadAllSlides() {
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (slide.imageUrl) {
        try {
          if (slide.imageUrl.startsWith('data:')) {
            const a = document.createElement('a');
            a.href = slide.imageUrl;
            a.download = `carousel-slide-${i + 1}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            const response = await fetch(slide.imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `carousel-slide-${i + 1}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
          console.error(`Failed to download slide ${i + 1}`);
        }
      }
    }
  }

  function openVaultModal() {
    const completedSlides = slides.filter(s => s.status === 'complete' && s.imageUrl);
    if (completedSlides.length === 0) {
      alert('No completed slides to add to vault');
      return;
    }
    
    // Pre-fill from carousel config
    const nicheSlug = niches.find(n => n.name === carouselConfig.niche)?.slug || '';
    setVaultForm({
      price: '5.00',
      caption: carouselConfig.topic || carouselConfig.title || '',
      category: '',
      niche: nicheSlug,
    });
    setShowVaultModal(true);
  }

  async function addAllToVault() {
    const completedSlides = slides.filter(s => s.status === 'complete' && s.imageUrl);
    if (completedSlides.length === 0) return;
    
    setAddingToVault(true);
    
    try {
      // Upload all slides and collect URLs
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < completedSlides.length; i++) {
        const slide = completedSlides[i];
        let fileUrl = slide.imageUrl!;
        
        // Upload to storage if base64
        if (slide.imageUrl!.startsWith('data:')) {
          const base64Data = slide.imageUrl!.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let j = 0; j < byteCharacters.length; j++) {
            byteNumbers[j] = byteCharacters.charCodeAt(j);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          
          const fileName = `vault-carousel-${Date.now()}-${i + 1}.png`;
          const { error: uploadError } = await supabase.storage
            .from('Vault')
            .upload(fileName, blob);
          
          if (uploadError) throw uploadError;
          
          const { data: publicUrl } = supabase.storage
            .from('Vault')
            .getPublicUrl(fileName);
          
          fileUrl = publicUrl.publicUrl;
        }
        
        uploadedUrls.push(fileUrl);
      }
      
      // Create single carousel vault item with all images
      const { error: insertError } = await supabase
        .from('vault_items')
        .insert({
          title: carouselConfig.title || `${completedSlides.length}-Slide Carousel`,
          images: uploadedUrls,
          folder_path: '',
          price: parseFloat(vaultForm.price),
          caption: vaultForm.caption,
          category: vaultForm.category || null,
          niche: vaultForm.niche || null,
          content_type: 'carousel',
          slide_count: uploadedUrls.length,
          is_active: true,
        });
      
      if (insertError) throw insertError;
      
      alert(`Added ${completedSlides.length}-slide carousel to vault!`);
      setShowVaultModal(false);
    } catch (error: any) {
      console.error('Error adding to vault:', error);
      alert('Failed to add to vault: ' + error.message);
    } finally {
      setAddingToVault(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#111111] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/studio" className="text-white/60 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                Carousel Creator
              </h1>
            </div>
            
            {step === 'review' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={openVaultModal}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add All to Vault
                </button>
                <button
                  onClick={downloadAllSlides}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
                >
                  <Download className="w-4 h-4" />
                  Download All
                </button>
                <button
                  onClick={saveCarousel}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#C96A2B] text-white rounded-lg hover:bg-[#B55D24]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save to Library
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {step === 'setup' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create New Carousel</h2>
              <p className="text-white/60">Configure your carousel settings</p>
            </div>

            {/* Mode Toggle */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-1 inline-flex w-full">
              <button
                onClick={() => setMode('form')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  mode === 'form' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <Wand2 className="w-4 h-4" />
                Structured Form
              </button>
              <button
                onClick={() => setMode('prompt')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  mode === 'prompt' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Open Prompt
              </button>
            </div>

            {/* Reference Image - shown for both modes */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <label className="block text-sm font-medium text-white/70 mb-2">
                <Eye className="w-4 h-4 inline mr-1" />
                Reference Image (optional)
              </label>
              <p className="text-white/40 text-xs mb-3">
                Upload an image to match its style across all carousel slides
              </p>
              
              {referenceImage ? (
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={referenceImage}
                      alt="Reference"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={clearReference}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex-1 text-white/50 text-sm">
                    <p className="text-green-400 mb-1">✓ Reference loaded</p>
                    <p>AI will analyze this and match its style for all slides.</p>
                  </div>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-purple-500/50 transition-colors">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-white/40 mx-auto mb-1" />
                    <span className="text-white/60 text-sm">Click to upload reference</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReferenceUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {mode === 'prompt' ? (
              /* Open Prompt Mode */
              <div className="space-y-6">
                <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Describe Your Carousel
                  </label>
                  <textarea
                    value={openPrompt}
                    onChange={(e) => setOpenPrompt(e.target.value)}
                    placeholder="Describe the carousel you want to create in detail. Include the topic, style, audience, key messages, and any specific requirements...

Example: Create a 5-slide carousel for a roofing company about '5 Signs Your Roof Needs Replacement'. Use a cinematic, professional style with dark blue and orange colors. Each slide should have bold headlines and short supporting text. Target homeowners aged 35-55."
                    rows={8}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 resize-none"
                  />
                  <p className="text-white/40 text-xs mt-2">
                    Be specific about style, colors, topic, audience, and key messages for best results.
                  </p>
                </div>

                <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
                  <label className="block text-sm font-medium text-white/70 mb-3">Number of Slides</label>
                  <div className="flex gap-2">
                    {SLIDE_COUNTS.map(count => (
                      <button
                        key={count}
                        onClick={() => setPromptSlideCount(count)}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                          promptSlideCount === count 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {count} Slides
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={initializeSlides}
                  disabled={!openPrompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate {promptSlideCount}-Slide Carousel
                </button>
              </div>
            ) : (
              /* Structured Form Mode */
              <>
            {/* Brand Selection */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <label className="block text-sm font-medium text-white/70 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Brand Profile (optional)
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => applyBrand(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                <option value="">No brand selected</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>

            {/* Basic Info */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4 space-y-4">
              <h3 className="text-white font-semibold">Carousel Info</h3>
              
              <div>
                <label className="block text-sm text-white/70 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={carouselConfig.title}
                  onChange={(e) => setCarouselConfig({...carouselConfig, title: e.target.value})}
                  placeholder="e.g., 5 Roofing Myths Debunked"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={carouselConfig.businessName}
                    onChange={(e) => setCarouselConfig({...carouselConfig, businessName: e.target.value})}
                    placeholder="e.g., ABC Roofing"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Niche (Library Category)</label>
                  <select
                    value={carouselConfig.niche}
                    onChange={(e) => setCarouselConfig({...carouselConfig, niche: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  >
                    {(niches.length > 0 ? niches.map(n => n.name) : DEFAULT_NICHES).map(niche => (
                      <option key={niche} value={niche}>{niche}</option>
                    ))}
                  </select>
                  <p className="text-white/40 text-xs mt-1">Images will be categorized under this niche in the Library</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-1">Topic/Subject</label>
                <input
                  type="text"
                  value={carouselConfig.topic}
                  onChange={(e) => setCarouselConfig({...carouselConfig, topic: e.target.value})}
                  placeholder="e.g., Signs your roof needs replacement"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
            </div>

            {/* Category */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <label className="block text-sm font-medium text-white/70 mb-3">Carousel Category</label>
              <div className="grid grid-cols-2 gap-2">
                {CAROUSEL_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCarouselConfig({...carouselConfig, category: cat.id})}
                    className={`p-3 rounded-lg text-left transition-all ${
                      carouselConfig.category === cat.id 
                        ? 'bg-purple-500/20 border border-purple-500/50' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-white font-medium text-sm">{cat.name}</p>
                    <p className="text-white/50 text-xs">{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Slide Count */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <label className="block text-sm font-medium text-white/70 mb-3">Number of Slides</label>
              <div className="flex gap-2">
                {SLIDE_COUNTS.map(count => (
                  <button
                    key={count}
                    onClick={() => setCarouselConfig({...carouselConfig, slideCount: count})}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                      carouselConfig.slideCount === count 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {count} Slides
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
              <label className="block text-sm font-medium text-white/70 mb-3">Brand Colors</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1">Primary</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={carouselConfig.primaryColor}
                      onChange={(e) => setCarouselConfig({...carouselConfig, primaryColor: e.target.value})}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={carouselConfig.primaryColor}
                      onChange={(e) => setCarouselConfig({...carouselConfig, primaryColor: e.target.value})}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Secondary</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={carouselConfig.secondaryColor}
                      onChange={(e) => setCarouselConfig({...carouselConfig, secondaryColor: e.target.value})}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={carouselConfig.secondaryColor}
                      onChange={(e) => setCarouselConfig({...carouselConfig, secondaryColor: e.target.value})}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={initializeSlides}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate {carouselConfig.slideCount}-Slide Carousel
            </button>
              </>
            )}
          </div>
        )}

        {(step === 'generate' || step === 'review') && (
          <div className="space-y-6">
            {/* Slide Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlideIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    activeSlideIndex === index 
                      ? 'border-purple-500' 
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  {slide.imageUrl ? (
                    <img src={slide.imageUrl} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      {slide.status === 'generating' ? (
                        <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                      ) : (
                        <span className="text-white/40 text-xs">{index + 1}</span>
                      )}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center py-0.5">
                    <span className="text-white text-xs">{index + 1}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Main Slide View */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">
                  Slide {activeSlideIndex + 1} of {slides.length}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                    disabled={activeSlideIndex === 0}
                    className="p-2 text-white/40 hover:text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveSlideIndex(Math.min(slides.length - 1, activeSlideIndex + 1))}
                    disabled={activeSlideIndex === slides.length - 1}
                    className="p-2 text-white/40 hover:text-white disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="aspect-square max-w-lg mx-auto bg-white/5 rounded-xl overflow-hidden flex items-center justify-center">
                {slides[activeSlideIndex]?.status === 'generating' ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Generating slide {activeSlideIndex + 1}...</p>
                  </div>
                ) : slides[activeSlideIndex]?.imageUrl ? (
                  <img
                    src={slides[activeSlideIndex].imageUrl}
                    alt={`Slide ${activeSlideIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-white/40">
                    {slides[activeSlideIndex]?.status === 'error' ? (
                      <>
                        <X className="w-16 h-16 mx-auto mb-4 text-red-500/50" />
                        <p className="text-red-400">Generation failed</p>
                        <p className="text-sm mt-1">Click "Generate Slide" below to retry</p>
                      </>
                    ) : (
                      <>
                        <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Slide will appear here</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {step === 'review' && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => regenerateSlide(activeSlideIndex)}
                    disabled={generatingSlideIndex !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50"
                  >
                    {generatingSlideIndex === activeSlideIndex ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    {slides[activeSlideIndex]?.imageUrl ? 'Regenerate Slide' : 'Generate Slide'}
                  </button>
                </div>
              )}
            </div>

            {/* Generate All Button */}
            {step === 'generate' && !loading && slides.every(s => s.status === 'pending') && (
              <div className="space-y-3">
                <button
                  onClick={mode === 'prompt' ? generateAllSlidesFromPrompt : generateAllSlides}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Now ({slides.length} Slides)
                </button>
                <button
                  onClick={addToQueue}
                  disabled={addingToQueue}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/20"
                >
                  {addingToQueue ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5" />
                      Add to Queue (Generate Later)
                    </>
                  )}
                </button>
              </div>
            )}
            
            {loading && (
              <div className="text-center py-4">
                <p className="text-white/60">
                  Generating slide {(generatingSlideIndex ?? 0) + 1} of {slides.length}...
                </p>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${((generatingSlideIndex ?? 0) + 1) / slides.length * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add All to Vault Modal */}
      {showVaultModal && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowVaultModal(false)}
        >
          <div 
            className="bg-[#111111] border border-white/10 rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-green-500" />
                Add All Slides to Vault
              </h3>
              <button
                onClick={() => setShowVaultModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <p className="text-white font-medium">
                {slides.filter(s => s.status === 'complete' && s.imageUrl).length} slides ready
              </p>
              <p className="text-white/50 text-sm">
                Each slide will be added as a separate vault item with the same settings below.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Price per slide ($) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={vaultForm.price}
                    onChange={(e) => setVaultForm({ ...vaultForm, price: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Niche
                </label>
                <select
                  value={vaultForm.niche}
                  onChange={(e) => setVaultForm({ ...vaultForm, niche: e.target.value, category: '' })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                >
                  <option value="">Select niche...</option>
                  {niches.map(niche => (
                    <option key={niche.id} value={niche.slug}>{niche.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Category
                </label>
                <select
                  value={vaultForm.category}
                  onChange={(e) => setVaultForm({ ...vaultForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  disabled={!vaultForm.niche}
                >
                  <option value="">{vaultForm.niche ? 'Select category...' : 'Select niche first'}</option>
                  {categories
                    .filter(cat => cat.niche_slug === vaultForm.niche)
                    .map(cat => (
                      <option key={cat.id} value={cat.slug || cat.name}>{cat.name}</option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-1">
                  Caption (for all slides)
                </label>
                <textarea
                  value={vaultForm.caption}
                  onChange={(e) => setVaultForm({ ...vaultForm, caption: e.target.value })}
                  rows={3}
                  placeholder="Caption buyers can copy for their post..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowVaultModal(false)}
                className="flex-1 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={addAllToVault}
                disabled={addingToVault || !vaultForm.price}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50"
              >
                {addingToVault ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add All to Vault
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
