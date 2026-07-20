'use client';

import { useState, FormEvent } from 'react';

const INDUSTRIES = [
  { value: 'roofing', label: 'Roofing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'painting', label: 'Painting' },
  { value: 'pool', label: 'Pool Service' },
  { value: 'pest', label: 'Pest Control' },
  { value: 'auto', label: 'Auto Repair' },
  { value: 'other', label: 'Other' },
];

export default function LogoClaimForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      businessName: formData.get('businessName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      industry: formData.get('industry'),
      marketingConsent: formData.get('marketingConsent') === 'on',
      serviceConsent: formData.get('serviceConsent') === 'on',
    };

    try {
      const res = await fetch('https://sites.getpipelineai.com/api/logo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl p-8 text-center">
        <p className="text-xl font-bold mb-2">Your free logo is on the way! 🎉</p>
        <p className="text-sm text-emerald-300/80">
          Check your inbox - our design team will email your custom premium logo shortly. Questions? Email{' '}
          <a href="mailto:Support@GetPipelineAI.com" className="underline">Support@GetPipelineAI.com</a> or call/text 1-888-247-7818.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input
        type="text"
        name="businessName"
        placeholder="Your Business Name"
        required
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
      />
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        required
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        required
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
      />
      <select
        name="industry"
        required
        defaultValue=""
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/70 focus:outline-none focus:border-emerald-500/50"
      >
        <option value="">Select Your Industry</option>
        {INDUSTRIES.map((i) => (
          <option key={i.value} value={i.value}>{i.label}</option>
        ))}
      </select>
      <div className="space-y-3">
        <label className="flex items-start gap-2 text-xs text-white/50">
          <input type="checkbox" name="marketingConsent" required className="mt-0.5" />
          <span><strong className="text-white/70">Marketing Consent:</strong> I agree to receive marketing text messages and emails from Get Pipeline AI about special offers, promotions, and updates at the number and email provided. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt-out.</span>
        </label>
        <label className="flex items-start gap-2 text-xs text-white/50">
          <input type="checkbox" name="serviceConsent" required className="mt-0.5" />
          <span><strong className="text-white/70">Account &amp; Service Alerts:</strong> I agree to receive operational text messages and emails from Get Pipeline AI regarding my account, appointments, reminders, and updates. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt-out.</span>
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-emerald-400 hover:to-cyan-400 transition-all disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Get My Free Logo'}
      </button>
      <p className="text-center text-white/30 text-xs">100% free. No purchase required.</p>
    </form>
  );
}
