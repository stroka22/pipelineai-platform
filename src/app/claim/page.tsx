'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PLAN_INFO = {
  full: {
    amount: '$497',
    subtitle: 'One-time payment. No hidden fees.',
    button: 'Continue to Payment - $497',
  },
  installments: {
    amount: '3 \u00D7 $179',
    subtitle: '$179 due today, then 2 monthly payments.',
    button: 'Continue to Payment - $179 Today',
  },
} as const;

type PlanKey = keyof typeof PLAN_INFO;

const INCLUDED: [string, string][] = [
  ['Custom Design', 'Professional design tailored to your business and industry'],
  ['Mobile Responsive', 'Looks great on phones, tablets, and desktops'],
  ['Contact Forms', 'Let customers reach you directly from your website'],
  ['SEO Optimized', 'Built to rank in Google for local searches'],
  ['Fast Hosting', 'Lightning-fast loading speeds included'],
  ['SSL Security', 'Secure HTTPS encryption for your site'],
];

const CLAIM_API = 'https://sites.getpipelineai.com/api/claim';

function Check() {
  return (
    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ClaimContent() {
  const searchParams = useSearchParams();
  const initialPlan: PlanKey = searchParams.get('plan') === 'installments' ? 'installments' : 'full';

  const [plan, setPlan] = useState<PlanKey>(initialPlan);
  const [form, setForm] = useState({
    name: '',
    businessName: searchParams.get('name') || '',
    email: '',
    phone: '',
    domain: '',
  });
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [serviceConsent, setServiceConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const businessId = searchParams.get('id') || '';
  const source = searchParams.get('source') || 'website';
  const info = PLAN_INFO[plan];

  const inputClass =
    'w-full px-4 py-3 bg-[#0f0f0f] border border-white/10 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition';

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!serviceConsent) {
      setError('Please agree to Account & Service Alerts to continue.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(CLAIM_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          businessId,
          source,
          plan,
          marketingConsent,
          serviceConsent,
        }),
      });
      const result = await res.json();
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error(result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Minimal focused header */}
      <header className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Pipeline AI" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold flex items-center gap-1">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">PIPELINE</span>
              <span className="text-white">AI</span>
            </span>
          </Link>
          <Link href="/websites" className="text-sm text-white/50 hover:text-white transition-colors">
            &larr; Back to Websites
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Claim Your Professional Website</h1>
          <p className="text-lg text-white/60">Get a stunning, mobile-friendly website for your business</p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {/* Price header */}
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white px-8 py-10 text-center">
            <div className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-2">Complete Website Package</div>
            <div className="text-5xl font-extrabold mb-2">{info.amount}</div>
            <div className="text-blue-100">{info.subtitle}</div>
          </div>

          <div className="px-6 md:px-8 py-10">
            {/* What's included */}
            <h2 className="text-2xl font-bold text-white mb-6">What&apos;s Included:</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {INCLUDED.map(([title, desc]) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500/15 rounded-lg flex items-center justify-center">
                    <Check />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="text-white/50 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-10 pt-10 border-t border-white/10 space-y-6">
              <h2 className="text-2xl font-bold text-white">Get Started:</h2>

              {/* Plan selector */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-3">Choose your payment option</label>
                <div className="grid sm:grid-cols-2 gap-4">
                  {(['full', 'installments'] as PlanKey[]).map((key) => {
                    const selected = plan === key;
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setPlan(key)}
                        className={`text-left cursor-pointer border-2 rounded-lg p-4 flex items-start gap-3 transition-colors ${
                          selected ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span
                          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                            selected ? 'border-blue-500' : 'border-white/30'
                          }`}
                        >
                          {selected && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                        </span>
                        <span>
                          <span className="block font-semibold text-white">
                            {key === 'full' ? 'Pay in full' : '3 easy payments'}
                          </span>
                          <span className="block text-sm text-white/50">
                            {key === 'full' ? '$497 one-time' : '$179/mo for 3 months'}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-white/40 mt-2">
                  Then $47/month for hosting &amp; support, starting after your launch fee. Cancel anytime.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className={inputClass}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={form.businessName}
                    onChange={(e) => update('businessName', e.target.value)}
                    className={inputClass}
                    placeholder="Your Business LLC"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className={inputClass}
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    className={inputClass}
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Preferred Domain (optional)</label>
                <div className="flex items-center">
                  <span className="text-white/40 mr-2">www.</span>
                  <input
                    type="text"
                    value={form.domain}
                    onChange={(e) => update('domain', e.target.value)}
                    className={inputClass}
                    placeholder="yourbusiness.com"
                  />
                </div>
                <p className="text-sm text-white/40 mt-1">We&apos;ll help you get a domain if you don&apos;t have one</p>
              </div>

              {/* Consent */}
              <div className="space-y-4">
                <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-blue-600"
                    />
                    <span className="text-sm text-white/60">
                      <span className="font-medium text-white">Marketing Consent</span>
                      <br />I agree to receive marketing text messages and emails from Get Pipeline AI about special
                      offers, promotions, and updates at the number and email provided. Message frequency varies. Msg &amp;
                      data rates may apply. Reply STOP to opt-out.
                    </span>
                  </label>
                </div>
                <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={serviceConsent}
                      onChange={(e) => setServiceConsent(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-blue-600"
                    />
                    <span className="text-sm text-white/60">
                      <span className="font-medium text-white">Account &amp; Service Alerts *</span>
                      <br />I agree to receive operational text messages and emails from Get Pipeline AI regarding my
                      account, appointments, reminders, and updates. Message frequency varies. Msg &amp; data rates may
                      apply. Reply STOP to opt-out.
                    </span>
                  </label>
                </div>
                <p className="text-xs text-white/40">
                  View our{' '}
                  <a href="https://sites.getpipelineai.com/privacy" className="text-blue-400 underline">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="https://sites.getpipelineai.com/terms" className="text-blue-400 underline">
                    Terms of Service
                  </a>
                  .
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 px-8 rounded-xl text-lg font-semibold transition shadow-lg shadow-blue-500/30"
              >
                {submitting ? 'Processing...' : info.button}
              </button>

              <p className="text-center text-sm text-white/40">
                Secure payment powered by Stripe. 30-day money-back guarantee.
              </p>
            </form>
          </div>
        </div>

        {/* Trust */}
        <div className="mt-10 text-center">
          <p className="text-white/50">
            Questions? Call or text{' '}
            <a href="tel:1-888-247-7818" className="text-blue-400 font-medium">
              1-888-247-7818
            </a>{' '}
            or email{' '}
            <a href="mailto:Support@GetPipelineAI.com" className="text-blue-400 font-medium">
              Support@GetPipelineAI.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030712] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      }
    >
      <ClaimContent />
    </Suspense>
  );
}
