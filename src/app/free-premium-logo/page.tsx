import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import LogoClaimForm from '@/components/LogoClaimForm'

export const metadata: Metadata = {
  title: 'Get a FREE Premium Logo for Your Business | Pipeline AI',
  description: 'Claim a professionally designed custom logo for your business - 100% free, no purchase required. Tell us about your business and we will email your logo.',
}

const STEPS = [
  { n: '1', title: 'Tell Us About Your Business', desc: 'Share your business name, industry, and contact info. Takes about 30 seconds.' },
  { n: '2', title: 'We Design Your Logo', desc: 'Our design team creates a premium, custom logo tailored to your brand.' },
  { n: '3', title: 'Delivered To Your Inbox', desc: 'We email your ready-to-use logo files. Yours to keep, completely free.' },
]

const BENEFITS = [
  'Professionally designed - not a template',
  'Custom to your business and industry',
  'Ready-to-use files delivered by email',
  'Yours to keep, no strings attached',
]

export default function FreePremiumLogoPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <Header />

      {/* Hero + Form */}
      <section className="relative pt-28 md:pt-32 pb-16">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-semibold mb-5">
                🎁 100% FREE - No Purchase Required
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
                Get a <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">FREE Premium Logo</span> for Your Business
              </h1>
              <p className="text-white/60 text-lg mb-6">
                Tell us about your business and our design team will create a professional, custom logo - and email it straight to you. No cost, no catch.
              </p>
              <ul className="space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-white/80">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold mb-1">Claim Your Free Logo</h2>
              <p className="text-white/50 text-sm mb-5">Fill out the form and we&apos;ll get to work.</p>
              <LogoClaimForm />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">{s.n}</div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upsell */}
      <section className="py-12 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-white/60 mb-4">Love your new logo? See what a full website could do for your business.</p>
          <Link href="/websites" className="inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Explore Websites - $497 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-white/40 text-sm border-t border-white/5">
        <p>&copy; 2026 Pipeline AI. All rights reserved.</p>
        <p className="mt-2">
          <Link href="/" className="hover:text-white/60">Home</Link>
          {' · '}
          <a href="tel:1-888-247-7818" className="hover:text-white/60">1-888-247-7818</a>
          {' · '}
          <a href="mailto:Support@GetPipelineAI.com" className="hover:text-white/60">Contact</a>
        </p>
      </footer>
    </div>
  )
}
