'use client'

import { useState, useEffect } from 'react'

const heroSlides = [
  {
    img: 'https://sites.getpipelineai.com/images/screenshots/sunshine-hvac-services.png',
    name: 'Sunshine HVAC Services',
    industry: 'HVAC',
  },
  {
    img: 'https://sites.getpipelineai.com/images/screenshots/pro-pipe-plumbing.png',
    name: 'Pro Pipe Plumbing',
    industry: 'Plumbing',
  },
  {
    img: 'https://sites.getpipelineai.com/images/screenshots/green-thumb-landscaping.png',
    name: 'Green Thumb Landscaping',
    industry: 'Landscaping',
  },
  {
    img: 'https://sites.getpipelineai.com/images/screenshots/garcia-sons-roofing.png',
    name: 'Garcia & Sons Roofing',
    industry: 'Roofing',
  },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Browser Chrome */}
      <div className="bg-[#1a1a1a] rounded-t-xl p-3 flex items-center gap-2 border border-white/10 border-b-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="flex-1 bg-[#252525] rounded-md px-4 py-1.5 text-white/40 text-sm text-center">
          yourbusiness.com
        </div>
      </div>

      {/* Screenshot Container */}
      <div className="bg-[#1a1a1a] border border-white/10 border-t-0 rounded-b-xl overflow-hidden relative">
        {heroSlides.map((slide, index) => (
          <img
            key={slide.name}
            src={slide.img}
            alt={`Website Preview - ${slide.name}`}
            className={`w-full transition-opacity duration-700 ${
              index === current ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          />
        ))}
      </div>

      {/* Caption */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#1a1a1a] px-6 py-2 rounded-full border border-white/10 text-sm text-white/70 whitespace-nowrap">
        ✨ {heroSlides[current].name} <span className="text-white/40">({heroSlides[current].industry})</span>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === current ? 'bg-blue-500 w-6' : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
