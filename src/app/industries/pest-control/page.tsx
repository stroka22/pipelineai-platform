'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  Check, 
  Lock, 
  Sparkles, 
  Phone, 
  Globe, 
  MapPin, 
  Palette, 
  Image as ImageIcon,
  Play,
  FileText,
  Calendar,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Download,
  Mail
} from 'lucide-react';
import { useState } from 'react';

const vaultCategories = [
  { name: 'Termite Authority Pack', icon: '🪵', count: 12, description: 'Damage warnings, inspection campaigns, prevention education' },
  { name: 'Roach Infestation Pack', icon: '🪳', count: 10, description: 'Infestation signs, night activity, why DIY fails' },
  { name: 'Rodent Warning Pack', icon: '🐀', count: 10, description: 'Attic invaders, chewed wires, entry point education' },
  { name: 'Mosquito Season Pack', icon: '🦟', count: 8, description: 'Breeding zones, backyard tips, seasonal urgency' },
  { name: 'Ant Invasion Pack', icon: '🐜', count: 8, description: 'Trail origins, colony education, recurring problems' },
  { name: 'General Pest Pack', icon: '🛡️', count: 15, description: 'Mixed pest awareness, prevention tips, service promos' },
  { name: 'Short-Form Reel Pack', icon: '🎬', count: 8, description: '15-30 second vertical videos with hooks' },
  { name: 'Seasonal Campaigns', icon: '📅', count: 12, description: 'Monthly pest themes aligned with homeowner concerns' },
];

const sampleCampaigns = [
  { 
    category: 'Termites',
    title: 'The $8,000 Pest Most Homeowners Never See',
    type: 'Carousel',
    slides: 5
  },
  { 
    category: 'Roaches',
    title: 'If You See One, There May Be 200 More',
    type: 'Carousel',
    slides: 6
  },
  { 
    category: 'Rodents',
    title: 'Hear Scratching at Night?',
    type: 'Reel',
    duration: '15s'
  },
  { 
    category: 'Mosquitoes',
    title: 'Backyard Breeding Zones Checklist',
    type: 'Carousel',
    slides: 5
  },
  { 
    category: 'Ants',
    title: 'Why Ants Keep Coming Back',
    type: 'Carousel',
    slides: 4
  },
  { 
    category: 'General',
    title: 'Spring Pest Prevention Guide',
    type: 'Carousel',
    slides: 7
  },
];

const packages = [
  {
    name: 'Starter Growth',
    price: 297,
    description: 'Perfect for getting started with consistent content',
    features: [
      '3 branded carousel campaigns',
      '1 short-form reel',
      'Captions included',
      'Logo & phone customization',
      'Delivered in 48 hours',
    ],
    popular: false,
    cta: 'Buy Starter Package',
  },
  {
    name: 'Authority Growth',
    price: 497,
    description: 'Build real authority with premium monthly content',
    features: [
      '4 premium carousel campaigns',
      '2 short-form reels',
      'Monthly pest theme',
      'Captions + CTAs',
      'Full brand customization',
      'Priority delivery (24 hrs)',
    ],
    popular: true,
    cta: 'Start Authority Package',
  },
  {
    name: 'Market Leader',
    price: 697,
    priceNote: 'Starting at',
    description: 'Dominate your local market with maximum content',
    features: [
      '8+ monthly assets',
      'Reels + carousels',
      'Seasonal campaigns',
      'Google Business post ideas',
      'Priority support',
      'Strategy consultation',
    ],
    popular: false,
    cta: 'Book Strategy Call',
  },
];

const individualProducts = [
  { name: 'Termite Carousel Pack', price: 97, category: 'Termites', items: 3 },
  { name: 'Roach Carousel Pack', price: 97, category: 'Roaches', items: 3 },
  { name: 'Rodent Carousel Pack', price: 97, category: 'Rodents', items: 3 },
  { name: 'Mosquito Carousel Pack', price: 97, category: 'Mosquitoes', items: 3 },
  { name: 'Ant Carousel Pack', price: 97, category: 'Ants', items: 3 },
  { name: 'General Pest Image Pack', price: 97, category: 'General', items: 5 },
  { name: 'Single Branded Reel', price: 147, category: 'Reels', items: 1 },
  { name: '3-Reel Pack', price: 347, category: 'Reels', items: 3 },
  { name: '3-Pack Carousel Bundle', price: 247, category: 'Bundle', items: 9 },
  { name: 'Founder Starter Bundle', price: 497, category: 'Bundle', items: 15 },
];

const seasonalCalendar = [
  { month: 'Jan', pest: 'Rodents', theme: 'Winter invaders seeking warmth' },
  { month: 'Feb', pest: 'Roaches', theme: 'Indoor infestation awareness' },
  { month: 'Mar', pest: 'Ants', theme: 'Spring awakening colonies' },
  { month: 'Apr', pest: 'Termites', theme: 'Swarm season begins' },
  { month: 'May', pest: 'Mosquitoes', theme: 'Breeding season starts' },
  { month: 'Jun', pest: 'Fleas/Ticks', theme: 'Pet & yard protection' },
  { month: 'Jul', pest: 'Summer Pests', theme: 'Peak activity awareness' },
  { month: 'Aug', pest: 'Spiders', theme: 'Indoor migration begins' },
  { month: 'Sep', pest: 'Rodents', theme: 'Fall invasion prep' },
  { month: 'Oct', pest: 'Prevention', theme: 'Winterization campaigns' },
  { month: 'Nov', pest: 'Holiday Pests', theme: 'Guest-ready homes' },
  { month: 'Dec', pest: 'Winter Pests', theme: 'Cold weather invaders' },
];

export default function PestControlPage() {
  const [activeTab, setActiveTab] = useState('termites');

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#081F33]/98 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Pipeline <span className="text-[#C96A2B]">AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="#packages"
              className="hidden md:inline-block text-white/80 hover:text-white font-medium text-sm"
            >
              Pricing
            </Link>
            <Link 
              href="https://calendly.com/brian-stroka22/30min"
              className="bg-[#C96A2B] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#B55D24] transition-all btn-premium"
            >
              Book a Call
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-navy text-white pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#C96A2B]/20 border border-[#C96A2B]/30 text-[#FACC15] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Shield className="w-4 h-4" />
                Built Exclusively for Pest Control Companies
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Pest Control Content That Makes Homeowners{' '}
                <span className="text-[#C96A2B]">Stop, Trust, and Call</span>
              </h1>
              
              <p className="text-xl text-white/80 mb-8 max-w-xl">
                Get premium pest-specific reels, carousel campaigns, captions, and branded marketing 
                assets customized with your logo, phone number, website, service area, and colors.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link 
                  href="https://calendly.com/brian-stroka22/30min"
                  className="bg-[#C96A2B] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#B55D24] transition-all btn-premium inline-flex items-center justify-center gap-2"
                >
                  Book Free Strategy Call
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="#packages"
                  className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2"
                >
                  Shop Instant Packages
                </Link>
              </div>
              
              <Link 
                href="#vault"
                className="text-[#C96A2B] font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
              >
                Preview The Asset Vault
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            
            {/* Hero Visual - Mockup */}
            <div className="flex-1 relative">
              <div className="relative">
                {/* Phone mockup */}
                <div className="bg-[#1a1a1a] rounded-[2.5rem] p-3 shadow-2xl max-w-[280px] mx-auto">
                  <div className="bg-[#081F33] rounded-[2rem] overflow-hidden">
                    <div className="h-6 bg-[#081F33] flex items-center justify-center">
                      <div className="w-20 h-4 bg-black rounded-full"></div>
                    </div>
                    <div className="p-4 space-y-3">
                      {['🪵 Termite Warning', '🪳 Roach Alert', '🐀 Rodent Signs', '🦟 Mosquito Season'].map((item, i) => (
                        <div key={i} className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-12 h-12 bg-[#C96A2B]/30 rounded-lg flex items-center justify-center text-xl">
                            {item.split(' ')[0]}
                          </div>
                          <div>
                            <div className="text-white text-sm font-semibold">{item.split(' ').slice(1).join(' ')}</div>
                            <div className="text-white/50 text-xs">Carousel • 5 slides</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-[#22C55E] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Customizable
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white text-[#081F33] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#C96A2B]" />
                  24-48hr Delivery
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-white/50 text-sm mt-12">
            Built specifically for pest control companies that want stronger local visibility, more trust, and more inbound calls.
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#081F33] mb-4">
              Most Pest Companies Don&apos;t Have a Content Problem.
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-[#C96A2B]">
              They Have a Trust Problem.
            </h3>
          </div>
          
          <p className="text-xl text-[#4B5563] text-center max-w-3xl mx-auto mb-12">
            Homeowners may find you through Google, referrals, or Facebook, but they still check your 
            online presence before calling. If your competitors look sharper, post more consistently, 
            and educate homeowners better—they win trust first.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              'Random posting with no strategy',
              'Weak or outdated social pages',
              'Competitors look bigger online',
              'No reels or modern short-form content',
              'No seasonal pest campaigns',
              'No time to create consistent content',
              'Missed calls and weak follow-up',
            ].map((pain, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-[#FEF2F2] rounded-xl">
                <div className="w-8 h-8 bg-[#EF4444]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#EF4444]">✕</span>
                </div>
                <span className="text-[#991B1B] font-medium">{pain}</span>
              </div>
            ))}
          </div>
          
          <p className="text-center text-2xl font-semibold text-[#081F33] mt-12">
            Your content should make homeowners feel like you are{' '}
            <span className="text-[#C96A2B]">the obvious expert</span>.
          </p>
        </div>
      </section>

      {/* Vault Introduction */}
      <section id="vault" className="py-24 bg-[#F8F3EA]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#C96A2B]/10 text-[#C96A2B] px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Introducing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#081F33] mb-4">
              The Pest Growth Asset Vault™
            </h2>
            <p className="text-xl text-[#4B5563] max-w-3xl mx-auto">
              A growing library of pest-control-specific marketing campaigns designed 
              to be quickly customized for your company.
            </p>
          </div>
          
          <p className="text-center text-lg text-[#4B5563] max-w-4xl mx-auto mb-12">
            The Asset Vault gives pest control companies access to ready-made educational campaigns 
            built around homeowner psychology, seasonal urgency, and high-converting pest topics.
          </p>
          
          {/* Vault Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vaultCategories.map((cat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm vault-card cursor-pointer group">
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className="text-lg font-bold text-[#081F33] mb-2">{cat.name}</h3>
                <p className="text-sm text-[#4B5563] mb-4">{cat.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9CA3AF]">{cat.count} assets</span>
                  <span className="text-[#C96A2B] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Preview <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <div className="absolute top-4 right-4 bg-[#22C55E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  Customizable
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vault Preview Section */}
      <section className="py-24 bg-[#081F33]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Preview The Content
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Sample previews are shown for demonstration only. Final assets are delivered 
              after purchase and customized with your company branding.
            </p>
          </div>
          
          {/* Preview Gallery */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sampleCampaigns.map((campaign, i) => (
              <div key={i} className="bg-white/5 rounded-2xl overflow-hidden group">
                <div className="relative h-48 bg-gradient-to-br from-[#C96A2B]/20 to-[#081F33] flex items-center justify-center watermark-overlay">
                  <div className="text-6xl opacity-30">{
                    campaign.category === 'Termites' ? '🪵' :
                    campaign.category === 'Roaches' ? '🪳' :
                    campaign.category === 'Rodents' ? '🐀' :
                    campaign.category === 'Mosquitoes' ? '🦟' :
                    campaign.category === 'Ants' ? '🐜' : '🛡️'
                  }</div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Lock className="w-8 h-8 text-white/80" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#C96A2B]">{campaign.category}</span>
                    <span className="text-xs text-white/50">{campaign.type} {campaign.slides ? `• ${campaign.slides} slides` : `• ${campaign.duration}`}</span>
                  </div>
                  <h3 className="text-white font-semibold">{campaign.title}</h3>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-full px-6 py-3">
              <Lock className="w-5 h-5 text-white/60" />
              <span className="text-white/80">50+ more assets inside the vault</span>
            </div>
          </div>
        </div>
      </section>

      {/* Customization Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#081F33] mb-4">
              Every Asset Is Customized For Your Company
            </h2>
            <p className="text-xl text-[#4B5563] max-w-2xl mx-auto">
              We don&apos;t hand you generic graphics. Your assets are personalized so they look 
              like professional campaigns created specifically for your company.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { icon: ImageIcon, label: 'Company Logo' },
              { icon: Phone, label: 'Phone Number' },
              { icon: Globe, label: 'Website' },
              { icon: MapPin, label: 'Service Area' },
              { icon: Palette, label: 'Brand Colors' },
              { icon: Zap, label: 'Offer/CTA' },
              { icon: MapPin, label: 'City Version' },
            ].map((item, i) => (
              <div key={i} className="bg-[#F8F3EA] rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-[#081F33] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-[#C96A2B]" />
                </div>
                <span className="text-sm font-medium text-[#081F33]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Monthly Deliverables */}
      <section className="py-24 bg-[#F8F3EA]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#081F33] mb-4">
              What We Can Create Each Month
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ImageIcon,
                title: 'Branded Carousel Campaigns',
                desc: 'Educational multi-slide content built around termites, roaches, rodents, mosquitoes, ants, and seasonal pest issues.',
              },
              {
                icon: Play,
                title: 'Short-Form Reels',
                desc: '15-30 second vertical videos for Instagram Reels, Facebook, TikTok, and YouTube Shorts.',
              },
              {
                icon: FileText,
                title: 'Captions + CTAs',
                desc: 'Platform-ready captions designed to educate, build trust, and prompt homeowners to call or message.',
              },
              {
                icon: Calendar,
                title: 'Seasonal Strategy Themes',
                desc: 'Monthly pest campaigns built around what homeowners are dealing with right now.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-14 h-14 bg-[#081F33] rounded-xl flex items-center justify-center mb-6">
                  <item.icon className="w-7 h-7 text-[#C96A2B]" />
                </div>
                <h3 className="text-xl font-bold text-[#081F33] mb-3">{item.title}</h3>
                <p className="text-[#4B5563]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Calendar */}
      <section className="py-24 bg-[#081F33]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              12-Month Pest Campaign Roadmap
            </h2>
            <p className="text-lg text-white/70">
              Content themes aligned with seasonal homeowner concerns
            </p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {seasonalCalendar.map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all">
                <div className="text-[#C96A2B] font-bold text-lg mb-1">{item.month}</div>
                <div className="text-white font-semibold text-sm mb-1">{item.pest}</div>
                <div className="text-white/50 text-xs">{item.theme}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#081F33] mb-4">
              Choose Your Growth Path
            </h2>
            <p className="text-xl text-[#4B5563]">
              Monthly packages or individual assets—you choose
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {packages.map((pkg, i) => (
              <div 
                key={i} 
                className={`rounded-2xl p-8 relative ${
                  pkg.popular 
                    ? 'bg-[#081F33] text-white ring-4 ring-[#C96A2B] ring-offset-4' 
                    : 'bg-[#F8F3EA]'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C96A2B] text-white text-sm font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                
                <h3 className={`text-2xl font-bold mb-2 ${pkg.popular ? 'text-white' : 'text-[#081F33]'}`}>
                  {pkg.name}
                </h3>
                
                <div className="mb-4">
                  {pkg.priceNote && (
                    <span className={`text-sm ${pkg.popular ? 'text-white/60' : 'text-[#4B5563]'}`}>
                      {pkg.priceNote}{' '}
                    </span>
                  )}
                  <span className={`text-4xl font-bold ${pkg.popular ? 'text-white' : 'text-[#081F33]'}`}>
                    ${pkg.price}
                  </span>
                  <span className={`${pkg.popular ? 'text-white/60' : 'text-[#4B5563]'}`}>/month</span>
                </div>
                
                <p className={`mb-6 ${pkg.popular ? 'text-white/70' : 'text-[#4B5563]'}`}>
                  {pkg.description}
                </p>
                
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 ${pkg.popular ? 'text-[#22C55E]' : 'text-[#22C55E]'}`} />
                      <span className={pkg.popular ? 'text-white/90' : 'text-[#4B5563]'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href={pkg.name === 'Market Leader' ? 'https://calendly.com/brian-stroka22/30min' : '#checkout'}
                  className={`block text-center py-4 rounded-xl font-semibold transition-all ${
                    pkg.popular 
                      ? 'bg-[#C96A2B] text-white hover:bg-[#B55D24]' 
                      : 'bg-[#081F33] text-white hover:bg-[#0a2a47]'
                  }`}
                >
                  {pkg.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Individual Products Store */}
      <section id="store" className="py-24 bg-[#F8F3EA]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#081F33] mb-4">
              Need Just One Campaign?
            </h2>
            <p className="text-xl text-[#4B5563]">
              Shop individual assets from the vault
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {individualProducts.map((product, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm vault-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-[#C96A2B] bg-[#C96A2B]/10 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  <span className="text-xs text-[#9CA3AF]">{product.items} asset{product.items > 1 ? 's' : ''}</span>
                </div>
                
                <h3 className="text-lg font-bold text-[#081F33] mb-4">{product.name}</h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#081F33]">${product.price}</span>
                  <Link 
                    href="#checkout"
                    className="bg-[#081F33] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#0a2a47] transition-all"
                  >
                    Buy Now
                  </Link>
                </div>
                
                <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex items-center gap-2 text-xs text-[#22C55E]">
                  <Check className="w-4 h-4" />
                  <span>Full customization included</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add-ons */}
          <div className="mt-12 bg-white rounded-2xl p-8">
            <h3 className="text-xl font-bold text-[#081F33] mb-6">Add-On Options</h3>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { name: 'Rush Delivery (24hrs)', price: 49 },
                { name: 'Additional City Version', price: 29 },
                { name: 'Extra Revision', price: 25 },
                { name: 'Additional Carousel Topic', price: 97 },
              ].map((addon, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#F8F3EA] rounded-xl">
                  <span className="text-sm font-medium text-[#081F33]">{addon.name}</span>
                  <span className="text-sm font-bold text-[#C96A2B]">+${addon.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture */}
      <section className="py-24 bg-[#081F33]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10">
            <Download className="w-12 h-12 text-[#C96A2B] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Not Ready to Buy Yet?
            </h2>
            <p className="text-lg text-white/70 mb-8">
              Get a free sample pack with 3 pest control content examples 
              delivered straight to your inbox.
            </p>
            
            <form className="space-y-4 max-w-md mx-auto">
              <input 
                type="text"
                placeholder="Your Name"
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C96A2B]"
              />
              <input 
                type="email"
                placeholder="Email Address"
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C96A2B]"
              />
              <input 
                type="text"
                placeholder="Company Name"
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C96A2B]"
              />
              <button 
                type="submit"
                className="w-full bg-[#C96A2B] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#B55D24] transition-all btn-premium"
              >
                Get Free Sample Pack
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-[#F8F3EA]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#081F33] mb-6">
            Ready To Fill Your Schedule,<br />
            <span className="text-[#C96A2B]">Not Just Your Content Calendar?</span>
          </h2>
          <p className="text-xl text-[#4B5563] mb-10 max-w-2xl mx-auto">
            Get pest control content built to make your company look like the obvious local expert.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="https://calendly.com/brian-stroka22/30min"
              className="bg-[#C96A2B] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#B55D24] transition-all btn-premium inline-flex items-center justify-center gap-2"
            >
              Book Free Strategy Call
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#packages"
              className="bg-[#081F33] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#0a2a47] transition-all inline-flex items-center justify-center gap-2"
            >
              Shop Asset Vault
            </Link>
            <Link 
              href="#"
              className="border-2 border-[#081F33] text-[#081F33] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#081F33] hover:text-white transition-all inline-flex items-center justify-center gap-2"
            >
              Request Custom Samples
            </Link>
          </div>
          
          <p className="text-sm text-[#9CA3AF]">
            Currently onboarding a limited number of pest companies at founder pricing.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#081F33] text-white/60 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Link href="/" className="text-2xl font-bold text-white mb-4 inline-block">
            Pipeline <span className="text-[#C96A2B]">AI</span>
          </Link>
          <p className="text-sm mb-4">
            Premium social media content for pest control companies
          </p>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Pipeline AI. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="sticky-cta md:hidden">
        <Link 
          href="https://calendly.com/brian-stroka22/30min"
          className="block w-full bg-[#C96A2B] text-white py-4 rounded-xl font-semibold text-center"
        >
          Book Free Strategy Call
        </Link>
      </div>
    </main>
  );
}
