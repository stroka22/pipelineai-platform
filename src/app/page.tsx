'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Target, TrendingUp, Building2, Bug, Wrench, Home, Briefcase, ChevronRight, Users, ShoppingBag, Dumbbell, Stethoscope, GraduationCap, Camera } from 'lucide-react';

const industries = [
  {
    name: 'Pest Control',
    slug: 'pest-control',
    icon: Bug,
    description: 'Termite, roach, rodent & mosquito campaigns',
    available: true,
    featured: true,
  },
  {
    name: 'Roofing',
    slug: 'roofing',
    icon: Home,
    description: 'Storm damage, inspections & replacement content',
    available: false,
    featured: false,
  },
  {
    name: 'HVAC',
    slug: 'hvac',
    icon: Wrench,
    description: 'Seasonal maintenance & emergency repair campaigns',
    available: false,
    featured: false,
  },
  {
    name: 'Real Estate',
    slug: 'real-estate',
    icon: Building2,
    description: 'Listing content, market updates & buyer guides',
    available: false,
    featured: false,
  },
  {
    name: 'Coaches & Consultants',
    slug: 'coaches',
    icon: Users,
    description: 'Authority-building content & client attraction',
    available: false,
    featured: false,
  },
  {
    name: 'E-Commerce',
    slug: 'ecommerce',
    icon: ShoppingBag,
    description: 'Product showcases, launches & promotional campaigns',
    available: false,
    featured: false,
  },
  {
    name: 'Fitness & Wellness',
    slug: 'fitness',
    icon: Dumbbell,
    description: 'Transformation content, tips & motivation',
    available: false,
    featured: false,
  },
  {
    name: 'Healthcare & Medical',
    slug: 'healthcare',
    icon: Stethoscope,
    description: 'Patient education & trust-building content',
    available: false,
    featured: false,
  },
  {
    name: 'Education & Courses',
    slug: 'education',
    icon: GraduationCap,
    description: 'Course promotion & thought leadership',
    available: false,
    featured: false,
  },
  {
    name: 'Photographers',
    slug: 'photographers',
    icon: Camera,
    description: 'Portfolio showcases & booking campaigns',
    available: false,
    featured: false,
  },
  {
    name: 'Mortgage & Lending',
    slug: 'mortgage',
    icon: Briefcase,
    description: 'Rate updates, loan education & trust-building content',
    available: false,
    featured: false,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#081F33]/98 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            Pipeline <span className="text-[#C96A2B]">AI</span>
          </Link>
          <Link 
            href="https://calendly.com/brian-stroka22/30min"
            className="bg-[#C96A2B] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#B55D24] transition-all btn-premium"
          >
            Book a Call
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-navy text-white pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#C96A2B]/20 border border-[#C96A2B]/30 text-[#FACC15] px-4 py-2 rounded-full text-sm font-semibold mb-8">
            <Sparkles className="w-4 h-4" />
            Premium Social Media Content for Any Industry
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            Content That Makes You <br className="hidden md:block" />
            <span className="text-[#C96A2B]">The Obvious Choice</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
            Done-for-you social media campaigns, reels, carousels, and branded assets 
            customized for your business. Your logo, your brand, your message.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="https://calendly.com/brian-stroka22/30min"
              className="bg-[#C96A2B] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#B55D24] transition-all btn-premium inline-flex items-center justify-center gap-2"
            >
              Book Free Strategy Call
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#industries"
              className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2"
            >
              Explore Industries
            </Link>
          </div>
          
          <p className="text-white/50 text-sm">
            Currently serving pest control companies • More industries coming soon
          </p>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-[#F8F3EA]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-[#081F33] rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-[#C96A2B]" />
              </div>
              <h3 className="text-xl font-bold text-[#081F33] mb-3">Industry-Specific</h3>
              <p className="text-[#4B5563]">
                Not generic templates. Real content built around what your audience actually cares about.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-[#081F33] rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-[#C96A2B]" />
              </div>
              <h3 className="text-xl font-bold text-[#081F33] mb-3">Fully Customized</h3>
              <p className="text-[#4B5563]">
                Your logo, phone number, website, service area, and brand colors on every single asset.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-14 h-14 bg-[#081F33] rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-[#C96A2B]" />
              </div>
              <h3 className="text-xl font-bold text-[#081F33] mb-3">Trust-Building</h3>
              <p className="text-[#4B5563]">
                Educational content that positions you as the expert your audience trusts first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#081F33] mb-4">
              Choose Your Industry
            </h2>
            <p className="text-xl text-[#4B5563] max-w-2xl mx-auto">
              Premium content vaults built for specific industries. 
              Each vault contains campaigns tailored to your market.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry) => (
              <div 
                key={industry.slug}
                className={`relative rounded-2xl p-8 transition-all vault-card ${
                  industry.available 
                    ? 'bg-[#081F33] text-white cursor-pointer' 
                    : 'bg-[#F3F4F6] text-[#9CA3AF]'
                } ${industry.featured ? 'ring-2 ring-[#C96A2B] ring-offset-4' : ''}`}
              >
                {industry.featured && (
                  <div className="absolute -top-3 left-6 bg-[#C96A2B] text-white text-xs font-bold px-3 py-1 rounded-full">
                    NOW AVAILABLE
                  </div>
                )}
                
                <industry.icon className={`w-10 h-10 mb-4 ${industry.available ? 'text-[#C96A2B]' : 'text-[#9CA3AF]'}`} />
                
                <h3 className={`text-2xl font-bold mb-2 ${industry.available ? 'text-white' : 'text-[#6B7280]'}`}>
                  {industry.name}
                </h3>
                
                <p className={`mb-6 ${industry.available ? 'text-white/70' : 'text-[#9CA3AF]'}`}>
                  {industry.description}
                </p>
                
                {industry.available ? (
                  <Link 
                    href={`/industries/${industry.slug}`}
                    className="inline-flex items-center gap-2 text-[#C96A2B] font-semibold hover:gap-3 transition-all"
                  >
                    Explore Asset Vault
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-[#9CA3AF]">Coming Soon</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[#F8F3EA]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#081F33] mb-4">
              How It Works
            </h2>
            <p className="text-xl text-[#4B5563]">
              From purchase to posting in 24-48 hours
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Choose', desc: 'Select your industry and pick a package or individual assets' },
              { step: '02', title: 'Submit', desc: 'Send us your logo, colors, phone, and service area' },
              { step: '03', title: 'Customize', desc: 'We brand every asset specifically for your company' },
              { step: '04', title: 'Post', desc: 'Receive your content and start building trust online' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-extrabold text-[#C96A2B]/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-[#081F33] mb-2">{item.title}</h3>
                <p className="text-[#4B5563]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-navy text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Look Like the <span className="text-[#C96A2B]">Obvious Expert</span>?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Stop posting random content. Start posting campaigns that make your 
            audience trust you before they ever reach out.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="https://calendly.com/brian-stroka22/30min"
              className="bg-[#C96A2B] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#B55D24] transition-all btn-premium inline-flex items-center justify-center gap-2"
            >
              Book Free Strategy Call
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/industries/pest-control"
              className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2"
            >
              Shop Pest Control Vault
            </Link>
          </div>
          
          <p className="text-white/40 text-sm mt-8">
            Currently onboarding pest control companies at founder pricing
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
            Premium social media content for businesses that want to stand out
          </p>
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Pipeline AI. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
