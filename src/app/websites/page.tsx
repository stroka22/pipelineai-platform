import type { Metadata } from 'next'
import HeroCarousel from './HeroCarousel'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'Professional Websites for Local Businesses | Pipeline AI',
  description: 'Get a professional, mobile-friendly website for your business. One-time $497 setup, then just $47/month for hosting, updates, and support.',
}

export default function WebsitesPage() {
  return (
    <div className="min-h-screen bg-[#030712]">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-500/10 text-blue-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-blue-500/20">
              🚀 Launch Your Website in 3 Days
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              Your Business Deserves<br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">A Website That Works</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
              We build stunning, mobile-friendly websites that turn visitors into customers. No tech skills needed. No hassle. Just results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="#pricing" className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-500 hover:to-blue-400 transition shadow-xl shadow-blue-500/30">
                Get Your Website - $497
              </a>
              <a href="#examples" className="text-white/60 font-medium hover:text-blue-400 transition flex items-center gap-2">
                See Examples
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </a>
            </div>
          </div>
          
          {/* Rotating Hero Mockup */}
          <HeroCarousel />
        </div>
      </section>
      
      {/* Trust Bar */}
      <section className="py-8 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/40 text-sm font-medium">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              No contracts
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              30-day money back
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Live in 3 days
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Secure checkout
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                No Website = <span className="text-red-400">Lost Customers</span>
              </h2>
              <div className="space-y-4 text-white/70">
                <p className="flex items-start gap-3">
                  <span className="text-red-400 text-xl">✗</span>
                  <span><strong className="text-white">97% of people</strong> search online before choosing a local business</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-400 text-xl">✗</span>
                  <span><strong className="text-white">75% judge credibility</strong> based on website design</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-red-400 text-xl">✗</span>
                  <span><strong className="text-white">Competitors with websites</strong> are stealing your customers right now</span>
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6">
                With Your New Website:
              </h3>
              <div className="space-y-4 text-white/70">
                <p className="flex items-start gap-3">
                  <span className="text-blue-400 text-xl">✓</span>
                  <span><strong className="text-white">Show up on Google</strong> when customers search for your services</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-blue-400 text-xl">✓</span>
                  <span><strong className="text-white">Look professional</strong> and build instant trust</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-blue-400 text-xl">✓</span>
                  <span><strong className="text-white">Get leads 24/7</strong> even while you sleep</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Examples */}
      <section id="examples" className="py-20 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Real Websites We&apos;ve Built</h2>
            <p className="text-white/50">Every site is custom-designed for the business and industry</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sunshine HVAC Services', location: 'Tampa, FL', url: 'https://sites.getpipelineai.com/previews/sunshine-hvac-services.html', img: 'sunshine-hvac-services' },
              { name: 'Pro Pipe Plumbing', location: 'Jacksonville, FL', url: 'https://sites.getpipelineai.com/previews/pro-pipe-plumbing.html', img: 'pro-pipe-plumbing' },
              { name: 'Green Thumb Landscaping', location: 'Sarasota, FL', url: 'https://sites.getpipelineai.com/previews/green-thumb-landscaping.html', img: 'green-thumb-landscaping' },
            ].map((site, i) => (
              <a key={i} href={site.url} target="_blank" rel="noopener noreferrer" className="group">
                <div className="bg-[#1a1a1a] rounded-xl overflow-hidden transition group-hover:ring-2 group-hover:ring-blue-500 border border-white/10">
                  <div className="bg-[#252525] p-2 flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-white/20"></div>
                      <div className="w-2 h-2 rounded-full bg-white/20"></div>
                      <div className="w-2 h-2 rounded-full bg-white/20"></div>
                    </div>
                  </div>
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={`https://sites.getpipelineai.com/images/screenshots/${site.img}.png`}
                      alt={site.name}
                      className="w-full object-cover object-top"
                    />
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="text-white font-semibold">{site.name}</div>
                  <div className="text-white/40 text-sm">{site.location}</div>
                </div>
              </a>
            ))}
          </div>
          <div className="text-center mt-10">
            <a href="#pricing" className="inline-block bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-400 transition shadow-xl shadow-blue-500/30">
              Get a Website Like These
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-white/50">No hidden fees. No surprises. Just a great website.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* One-time */}
            <div className="bg-[#1a1a1a] border-2 border-blue-500 rounded-2xl overflow-hidden relative">
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-8">
                <div className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-1">Website Build</div>
                <div className="text-5xl font-extrabold mb-1">$497</div>
                <div className="text-blue-100">One-time payment</div>
              </div>
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {[
                    'Custom design for your industry',
                    'Mobile-responsive on all devices',
                    'Contact forms & click-to-call',
                    'Google-optimized for local SEO',
                    'Lightning-fast load times',
                    'SSL security certificate',
                    'Professional copywriting',
                    'Up to 5 pages included',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/70">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="https://sites.getpipelineai.com/claim/" className="block w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-4 rounded-xl font-semibold text-lg hover:from-blue-500 hover:to-blue-400 transition shadow-lg shadow-blue-500/30">
                  Get Started Now
                </a>
                <p className="text-center text-sm text-white/40 mt-4">30-day money-back guarantee</p>
              </div>
            </div>
            
            {/* Monthly */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden relative">
              <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                LAUNCH BONUS
              </div>
              <div className="bg-[#252525] text-white p-8">
                <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">Monthly Hosting</div>
                <div className="text-5xl font-extrabold mb-1">$47<span className="text-xl font-medium text-gray-400">/mo</span></div>
                <div className="text-gray-400">After your site is built</div>
              </div>
              <div className="p-8">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                  <div className="text-green-400 font-semibold text-sm mb-2">🎁 First 30 Days Bonus:</div>
                  <ul className="text-green-300/80 text-sm space-y-1">
                    <li>• Custom logo design for your business</li>
                    <li>• Social media profile & cover images</li>
                  </ul>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    'Premium cloud hosting',
                    '99.9% uptime guarantee',
                    'Daily automatic backups',
                    'SSL certificate renewed',
                    'Security monitoring & patches',
                    '2 content updates per month',
                    'Email support',
                    'Cancel anytime',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/60">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-center text-sm text-white/40">
                  Included with every website purchase
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Why Local Businesses Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📱', title: 'Mobile-First Design', desc: 'Over 60% of searches happen on mobile. Your site will look perfect on phones, tablets, and desktops.' },
              { icon: '🔍', title: 'Built for Google', desc: 'SEO-optimized from the ground up so customers in your area can find you when they search.' },
              { icon: '⚡', title: 'Lightning Fast', desc: 'Slow sites lose customers. Your website will load in under 2 seconds on any connection.' },
              { icon: '📞', title: 'Click-to-Call', desc: 'Make it easy for customers to contact you with one tap on their phone.' },
              { icon: '🔒', title: 'Secure & Reliable', desc: 'SSL encryption, daily backups, and 99.9% uptime guarantee.' },
              { icon: '💰', title: 'No Hidden Fees', desc: '$497 setup + $47/month. That\'s it. No surprise charges, cancel anytime.' },
            ].map((item, i) => (
              <div key={i} className="bg-[#1a1a1a] rounded-xl p-6 border border-white/10">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-lg text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Sign Up', desc: 'Complete your order and tell us about your business' },
              { num: '2', title: 'We Build', desc: 'Our team creates your custom website in 2-3 days' },
              { num: '3', title: 'Review', desc: 'You review and request any changes you want' },
              { num: '4', title: 'Launch', desc: 'We connect your domain and your site goes live' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 text-white">
                  {item.num}
                </div>
                <h3 className="font-semibold text-lg text-white mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Frequently Asked Questions</h2>
          <div className="space-y-0">
            {[
              { q: "What if I don't have a domain name?", a: "No problem! We'll help you find and register the perfect domain for your business. Domain registration is typically $15-20/year." },
              { q: 'Can I cancel the monthly plan anytime?', a: "Yes! There are no contracts or commitments. You can cancel your $47/month hosting plan anytime." },
              { q: 'What if I need changes after the site is built?', a: 'Your $47/month plan includes 2 free content updates per month. For larger changes, we offer affordable add-on services.' },
              { q: 'Do I own my website?', a: "Yes! You own your website content and design. We simply host and maintain it for you." },
              { q: 'How long does it take to build my site?', a: 'Most websites are completed within 2-3 business days.' },
              { q: 'What do you need from me to get started?', a: "Just your business info, logo (if you have one), any photos you want to use, and a description of your services." },
            ].map((item, i) => (
              <div key={i} className="border-b border-white/10 py-6">
                <h3 className="font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-white/60">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-cyan-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Your Website?</h2>
          <p className="text-lg opacity-90 mb-8">Join hundreds of local businesses with professional websites</p>
          <a href="https://sites.getpipelineai.com/claim/" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition">
            Get Started - $497
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-white/40 text-sm">
        <p>&copy; 2026 Pipeline AI. All rights reserved.</p>
        <p className="mt-2">
          <a href="/" className="hover:text-white/60">Home</a>
          {' · '}
          <a href="mailto:hello@getpipelineai.com" className="hover:text-white/60">Contact</a>
        </p>
      </footer>
    </div>
  )
}
