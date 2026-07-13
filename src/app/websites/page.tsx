import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Professional Websites for Local Businesses | Pipeline AI',
  description: 'Get a professional, mobile-friendly website for your business. One-time $497 setup, then just $47/month for hosting, updates, and support.',
}

export default function WebsitesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 py-5">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <a href="/" className="text-xl font-bold text-gray-900">
            Pipeline<span className="text-emerald-500">AI</span>
          </a>
          <a href="#pricing" className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-emerald-600 transition">
            Get Started
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            A Professional Website<br />for Your Business
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Stop losing customers to competitors with better websites. Get a stunning, mobile-friendly site that converts visitors into paying customers.
          </p>
        </div>
      </section>

      {/* Pricing Card */}
      <section id="pricing" className="pb-20">
        <div className="max-w-lg mx-auto px-6">
          <div className="border-2 border-emerald-500 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-8 text-center">
              <div className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-2">Complete Website Package</div>
              <div className="text-6xl font-extrabold">$497 <span className="text-2xl font-medium opacity-80">one-time</span></div>
              <div className="text-sm opacity-90 mt-2">Then $47/month for hosting + support</div>
            </div>
            <div className="p-8">
              <h3 className="font-bold text-gray-900 mb-4">What&apos;s included:</h3>
              <ul className="space-y-4 mb-8">
                {[
                  { title: 'Custom design', desc: 'tailored to your business and industry' },
                  { title: 'Mobile-responsive', desc: 'layout that looks great on any device' },
                  { title: 'Contact forms', desc: 'so customers can reach you 24/7' },
                  { title: 'SEO optimized', desc: 'to rank in local Google searches' },
                  { title: 'Fast loading', desc: 'speeds for better user experience' },
                  { title: 'SSL certificate', desc: 'for secure HTTPS connection' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600"><strong className="text-gray-900">{item.title}</strong> {item.desc}</span>
                  </li>
                ))}
              </ul>
              <a href="https://sites.getpipelineai.com/claim/" className="block w-full bg-emerald-500 text-white text-center py-4 rounded-lg font-semibold hover:bg-emerald-600 transition">
                Get Your Website Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Plan */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-3">What&apos;s Included in the $47/Month</h2>
          <p className="text-gray-600 text-center mb-10">Everything you need to keep your website running smoothly</p>
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-4xl font-extrabold text-gray-900">$47</span>
              <span className="text-gray-400">/ month</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'Premium Hosting', desc: 'Fast, reliable servers with 99.9% uptime' },
                { title: 'SSL Certificate', desc: 'Keep your site secure with HTTPS' },
                { title: 'Content Updates', desc: '2 free text/image updates per month' },
                { title: 'Security Updates', desc: 'Regular patches to keep you protected' },
                { title: 'Daily Backups', desc: 'Your site is backed up every day' },
                { title: 'Email Support', desc: 'Get help when you need it' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <div className="font-semibold text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Local Businesses Choose Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📱', title: 'Mobile-First Design', desc: 'Over 60% of searches happen on mobile. Your site will look perfect on phones, tablets, and desktops.' },
              { icon: '🔍', title: 'Built for Google', desc: 'SEO-optimized from the ground up so customers in your area can find you when they search.' },
              { icon: '⚡', title: 'Lightning Fast', desc: 'Slow sites lose customers. Your website will load in under 2 seconds on any connection.' },
              { icon: '📞', title: 'Click-to-Call', desc: 'Make it easy for customers to contact you with one tap on their phone.' },
              { icon: '🔒', title: 'Secure & Reliable', desc: 'SSL encryption, daily backups, and 99.9% uptime guarantee.' },
              { icon: '💰', title: 'No Hidden Fees', desc: '$497 setup + $47/month. That\'s it. No surprise charges, cancel anytime.' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Sign Up', desc: 'Complete your order and tell us about your business' },
              { num: '2', title: 'We Build', desc: 'Our team creates your custom website in 5-7 days' },
              { num: '3', title: 'Review', desc: 'You review and request any changes you want' },
              { num: '4', title: 'Launch', desc: 'We connect your domain and your site goes live' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.num}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-0">
            {[
              { q: "What if I don't have a domain name?", a: "No problem! We'll help you find and register the perfect domain for your business. Domain registration is typically $15-20/year." },
              { q: 'Can I cancel the monthly plan anytime?', a: "Yes! There are no contracts or commitments. You can cancel your $47/month hosting plan anytime." },
              { q: 'What if I need changes after the site is built?', a: 'Your $47/month plan includes 2 free content updates per month. For larger changes, we offer affordable add-on services.' },
              { q: 'Do I own my website?', a: "Yes! You own your website content and design. We simply host and maintain it for you." },
              { q: 'How long does it take to build my site?', a: 'Most websites are completed within 5-7 business days.' },
              { q: 'What do you need from me to get started?', a: "Just your business info, logo (if you have one), any photos you want to use, and a description of your services." },
            ].map((item, i) => (
              <div key={i} className="border-b border-gray-100 py-6">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Your Website?</h2>
          <p className="text-lg opacity-90 mb-8">Join hundreds of local businesses with professional websites</p>
          <a href="https://sites.getpipelineai.com/claim/" className="inline-block bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition">
            Get Started - $497
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-400 text-sm">
        <p>&copy; 2026 Pipeline AI. All rights reserved.</p>
        <p className="mt-2">
          <a href="/" className="hover:text-gray-600">Home</a>
          {' · '}
          <a href="mailto:hello@getpipelineai.com" className="hover:text-gray-600">Contact</a>
        </p>
      </footer>
    </div>
  )
}
