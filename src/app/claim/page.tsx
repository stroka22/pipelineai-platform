'use client';

import { useState, useEffect } from 'react';
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

const SELF_SERVE_INFO = {
  monthly: {
    amount: '$49',
    per: '/mo',
    subtitle: '7-day free trial, then $49/month. Cancel anytime.',
    button: 'Start 7-Day Free Trial',
  },
  annual: {
    amount: '$490',
    per: '/yr',
    subtitle: '7-day free trial, then $490/year (save ~2 months). Cancel anytime.',
    button: 'Start 7-Day Free Trial',
  },
} as const;

type BillingKey = keyof typeof SELF_SERVE_INFO;

const INCLUDED_EN: [string, string][] = [
  ['Custom Design', 'Professional design tailored to your business and industry'],
  ['Mobile Responsive', 'Looks great on phones, tablets, and desktops'],
  ['Bilingual (EN/ES)', 'Automatic English & Spanish version to reach more customers'],
  ['Contact Forms', 'Let customers reach you directly from your website'],
  ['SEO Optimized', 'Built to rank in Google for local searches'],
  ['Fast Hosting', 'Lightning-fast loading speeds included'],
  ['SSL Security', 'Secure HTTPS encryption for your site'],
];
const INCLUDED_ES: [string, string][] = [
  ['Diseño personalizado', 'Diseño profesional adaptado a tu negocio e industria'],
  ['Adaptable a móviles', 'Se ve genial en teléfonos, tabletas y computadoras'],
  ['Bilingüe (EN/ES)', 'Versión automática en inglés y español para llegar a más clientes'],
  ['Formularios de contacto', 'Permite que los clientes te contacten directamente desde tu sitio'],
  ['Optimizado para SEO', 'Diseñado para posicionar en Google en búsquedas locales'],
  ['Hospedaje rápido', 'Velocidades de carga ultrarrápidas incluidas'],
  ['Seguridad SSL', 'Cifrado HTTPS seguro para tu sitio'],
];

const CLAIM_API = 'https://sites.getpipelineai.com/api/claim';

function Check() {
  return (
    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function ClaimPage() {
  const [plan, setPlan] = useState<PlanKey>('full');
  const [selfServe, setSelfServe] = useState(false);
  const [billing, setBilling] = useState<BillingKey>('monthly');
  const [form, setForm] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    domain: '',
  });
  const [businessId, setBusinessId] = useState('');
  const [source, setSource] = useState('website');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [serviceConsent, setServiceConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState<'en' | 'es'>('en');

  const tr = (en: string, es: string) => (lang === 'es' ? es : en);

  useEffect(() => {
    let initial: 'en' | 'es' = 'en';
    try {
      const saved = localStorage.getItem('pa_site_lang');
      if (saved === 'en' || saved === 'es') initial = saved;
      else if ((navigator.language || '').toLowerCase().startsWith('es')) initial = 'es';
    } catch {
      /* ignore */
    }
    setLang(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function chooseLang(l: 'en' | 'es') {
    setLang(l);
    try {
      localStorage.setItem('pa_site_lang', l);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan');
    if (planParam === 'self_serve') setSelfServe(true);
    else if (planParam === 'installments') setPlan('installments');
    if (params.get('billing') === 'annual') setBilling('annual');
    const name = params.get('name');
    if (name) setForm((f) => ({ ...f, businessName: name }));
    setBusinessId(params.get('id') || '');
    setSource(params.get('source') || 'website');
  }, []);

  const info = selfServe ? SELF_SERVE_INFO[billing] : PLAN_INFO[plan];
  const per = selfServe ? SELF_SERVE_INFO[billing].per : '';

  const subtitleText = selfServe
    ? billing === 'monthly'
      ? tr('7-day free trial, then $49/month. Cancel anytime.', 'Prueba gratis de 7 días, luego $49/mes. Cancela cuando quieras.')
      : tr('7-day free trial, then $490/year (save ~2 months). Cancel anytime.', 'Prueba gratis de 7 días, luego $490/año (ahorra ~2 meses). Cancela cuando quieras.')
    : plan === 'full'
    ? tr('One-time payment. No hidden fees.', 'Pago único. Sin cargos ocultos.')
    : tr('$179 due today, then 2 monthly payments.', '$179 hoy, luego 2 pagos mensuales.');
  const buttonText = submitting
    ? tr('Processing...', 'Procesando...')
    : selfServe
    ? tr('Start 7-Day Free Trial', 'Comienza tu prueba gratis de 7 días')
    : plan === 'full'
    ? tr('Continue to Payment - $497', 'Continuar al pago - $497')
    : tr('Continue to Payment - $179 Today', 'Continuar al pago - $179 hoy');

  const inputClass =
    'w-full px-4 py-3 bg-[#0f0f0f] border border-white/10 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition';

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!serviceConsent) {
      setError(tr('Please agree to Account & Service Alerts to continue.', 'Acepta las Alertas de Cuenta y Servicio para continuar.'));
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
          plan: selfServe ? 'self_serve' : plan,
          billing: selfServe ? billing : undefined,
          marketingConsent,
          serviceConsent,
        }),
      });
      const result = await res.json();
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error(result.error || tr('Something went wrong. Please try again.', 'Algo salió mal. Inténtalo de nuevo.'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('Something went wrong. Please try again.', 'Algo salió mal. Inténtalo de nuevo.'));
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Language toggle */}
      <div
        role="group"
        aria-label="Language / Idioma"
        style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 60, display: 'flex', gap: 2, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 9999, boxShadow: '0 2px 10px rgba(0,0,0,.15)', padding: 3 }}
      >
        <button type="button" onClick={() => chooseLang('en')} aria-pressed={lang === 'en'} style={{ border: 0, cursor: 'pointer', fontWeight: 600, fontSize: 12, padding: '6px 11px', borderRadius: 9999, background: lang === 'en' ? '#111827' : 'transparent', color: lang === 'en' ? '#fff' : '#374151' }}>
          EN
        </button>
        <button type="button" onClick={() => chooseLang('es')} aria-pressed={lang === 'es'} style={{ border: 0, cursor: 'pointer', fontWeight: 600, fontSize: 12, padding: '6px 11px', borderRadius: 9999, background: lang === 'es' ? '#111827' : 'transparent', color: lang === 'es' ? '#fff' : '#374151' }}>
          ES
        </button>
      </div>

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
            &larr; {tr('Back to Websites', 'Volver a Sitios Web')}
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{selfServe ? tr('Launch Your Website', 'Lanza Tu Sitio Web') : tr('Claim Your Professional Website', 'Reclama Tu Sitio Web Profesional')}</h1>
          <p className="text-lg text-white/60">{selfServe ? tr('Start your 7-day free trial. No setup fee, cancel anytime.', 'Comienza tu prueba gratis de 7 días. Sin cargo de instalación, cancela cuando quieras.') : tr('Get a stunning, mobile-friendly website for your business', 'Obtén un sitio web impresionante y adaptable a móviles para tu negocio')}</p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {/* Price header */}
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white px-8 py-10 text-center">
            <div className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-2">{selfServe ? tr('Pipeline AI Website', 'Sitio Web Pipeline AI') : tr('Complete Website Package', 'Paquete Completo de Sitio Web')}</div>
            <div className="text-5xl font-extrabold mb-2">
              {info.amount}
              {per && <span className="text-2xl font-semibold">{per}</span>}
            </div>
            <div className="text-blue-100">{subtitleText}</div>
          </div>

          <div className="px-6 md:px-8 py-10">
            {/* What's included */}
            <h2 className="text-2xl font-bold text-white mb-6">{tr("What's Included:", 'Lo Que Incluye:')}</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {(lang === 'es' ? INCLUDED_ES : INCLUDED_EN).map(([title, desc]) => (
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
              <h2 className="text-2xl font-bold text-white">{tr('Get Started:', 'Comienza:')}</h2>

              {/* Plan selector */}
              {selfServe ? (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">{tr('Choose your billing', 'Elige tu facturación')}</label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {(['monthly', 'annual'] as BillingKey[]).map((key) => {
                      const selected = billing === key;
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => setBilling(key)}
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
                            <span className="block font-semibold text-white">{key === 'monthly' ? tr('Monthly', 'Mensual') : tr('Annual', 'Anual')}</span>
                            <span className="block text-sm text-white/50">
                              {key === 'monthly' ? tr('$49/month', '$49/mes') : tr('$490/year - save ~2 months', '$490/año - ahorra ~2 meses')}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-white/40 mt-2">
                    {tr(
                      "7-day free trial - you won't be charged today. Cancel anytime before it ends and pay nothing.",
                      'Prueba gratis de 7 días - hoy no se te cobrará. Cancela en cualquier momento antes de que termine y no pagas nada.'
                    )}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">{tr('Choose your payment option', 'Elige tu forma de pago')}</label>
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
                              {key === 'full' ? tr('Pay in full', 'Pago completo') : tr('3 easy payments', '3 pagos fáciles')}
                            </span>
                            <span className="block text-sm text-white/50">
                              {key === 'full' ? tr('$497 one-time', '$497 pago único') : tr('$179/mo for 3 months', '$179/mes por 3 meses')}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-white/40 mt-2">
                    {tr(
                      'Then $47/month for hosting & support, starting after your launch fee. Cancel anytime.',
                      'Luego $47/mes por hospedaje y soporte, a partir de tu cuota de lanzamiento. Cancela cuando quieras.'
                    )}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">{tr('Your Name *', 'Tu Nombre *')}</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className={inputClass}
                    placeholder={tr('John Smith', 'Juan Pérez')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">{tr('Business Name *', 'Nombre del Negocio *')}</label>
                  <input
                    type="text"
                    required
                    value={form.businessName}
                    onChange={(e) => update('businessName', e.target.value)}
                    className={inputClass}
                    placeholder={tr('Your Business LLC', 'Tu Negocio LLC')}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">{tr('Email Address *', 'Correo Electrónico *')}</label>
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
                  <label className="block text-sm font-medium text-white/70 mb-2">{tr('Phone Number *', 'Número de Teléfono *')}</label>
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
                <label className="block text-sm font-medium text-white/70 mb-2">{tr('Preferred Domain (optional)', 'Dominio Preferido (opcional)')}</label>
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
                <p className="text-sm text-white/40 mt-1">{tr("We'll help you get a domain if you don't have one", 'Te ayudamos a conseguir un dominio si no tienes uno')}</p>
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
                      <span className="font-medium text-white">{tr('Marketing Consent', 'Consentimiento de Marketing')}</span>
                      <br />
                      {tr(
                        'I agree to receive marketing text messages and emails from Get Pipeline AI about special offers, promotions, and updates at the number and email provided. Message frequency varies. Msg & data rates may apply. Reply STOP to opt-out.',
                        'Acepto recibir mensajes de texto y correos de marketing de Get Pipeline AI sobre ofertas especiales, promociones y novedades al número y correo proporcionados. La frecuencia de mensajes varía. Pueden aplicar tarifas de mensajes y datos. Responde STOP para cancelar.'
                      )}
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
                      <span className="font-medium text-white">{tr('Account & Service Alerts *', 'Alertas de Cuenta y Servicio *')}</span>
                      <br />
                      {tr(
                        'I agree to receive operational text messages and emails from Get Pipeline AI regarding my account, appointments, reminders, and updates. Message frequency varies. Msg & data rates may apply. Reply STOP to opt-out.',
                        'Acepto recibir mensajes de texto y correos operativos de Get Pipeline AI sobre mi cuenta, citas, recordatorios y novedades. La frecuencia de mensajes varía. Pueden aplicar tarifas de mensajes y datos. Responde STOP para cancelar.'
                      )}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-white/40">
                  {tr('View our', 'Consulta nuestra')}{' '}
                  <a href="https://sites.getpipelineai.com/privacy" className="text-blue-400 underline">
                    {tr('Privacy Policy', 'Política de Privacidad')}
                  </a>{' '}
                  {tr('and', 'y')}{' '}
                  <a href="https://sites.getpipelineai.com/terms" className="text-blue-400 underline">
                    {tr('Terms of Service', 'Términos del Servicio')}
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
                {buttonText}
              </button>

              <p className="text-center text-sm text-white/40">
                {tr('Secure payment powered by Stripe.', 'Pago seguro con tecnología de Stripe.')}{' '}
                {selfServe
                  ? tr('14-day money-back guarantee.', 'Garantía de reembolso de 14 días.')
                  : tr('30-day money-back guarantee.', 'Garantía de reembolso de 30 días.')}
              </p>
            </form>
          </div>
        </div>

        {/* Trust */}
        <div className="mt-10 text-center">
          <p className="text-white/50">
            {tr('Questions? Call or text', '¿Preguntas? Llama o envía un mensaje al')}{' '}
            <a href="tel:1-888-247-7818" className="text-blue-400 font-medium">
              1-888-247-7818
            </a>{' '}
            {tr('or email', 'o escribe a')}{' '}
            <a href="mailto:Support@GetPipelineAI.com" className="text-blue-400 font-medium">
              Support@GetPipelineAI.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
