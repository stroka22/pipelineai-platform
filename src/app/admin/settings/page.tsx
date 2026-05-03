'use client';

import { useState } from 'react';
import { Save, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    calendlyLink: 'https://calendly.com/brian-stroka22/30min',
    notificationEmail: '',
    adminPassword: '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In a real app, you'd save these to Supabase or environment
    localStorage.setItem('pipelineai_settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#081F33]">Settings</h1>
        <p className="text-[#4B5563]">Manage your Pipeline AI configuration</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Booking Link */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#081F33] mb-4">Booking Link</h2>
          <div>
            <label className="block text-sm font-medium text-[#081F33] mb-2">Calendly URL</label>
            <input
              type="url"
              value={settings.calendlyLink}
              onChange={(e) => setSettings({ ...settings, calendlyLink: e.target.value })}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
              placeholder="https://calendly.com/your-link"
            />
            <p className="text-xs text-[#9CA3AF] mt-2">
              This link is used for all "Book a Call" buttons on the site
            </p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#081F33] mb-4">Notifications</h2>
          <div>
            <label className="block text-sm font-medium text-[#081F33] mb-2">Notification Email</label>
            <input
              type="email"
              value={settings.notificationEmail}
              onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
              placeholder="you@example.com"
            />
            <p className="text-xs text-[#9CA3AF] mt-2">
              Receive email notifications for new orders and leads
            </p>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#081F33] mb-4">Security</h2>
          <div>
            <label className="block text-sm font-medium text-[#081F33] mb-2">Change Admin Password</label>
            <input
              type="password"
              value={settings.adminPassword}
              onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
              placeholder="Enter new password"
            />
            <p className="text-xs text-[#9CA3AF] mt-2">
              Current password: pipeline2024 (change this!)
            </p>
          </div>
        </div>

        {/* External Links */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#081F33] mb-4">External Services</h2>
          <div className="space-y-4">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-all"
            >
              <div>
                <div className="font-medium text-[#081F33]">Supabase Dashboard</div>
                <div className="text-sm text-[#4B5563]">Manage database and authentication</div>
              </div>
              <ExternalLink className="w-5 h-5 text-[#9CA3AF]" />
            </a>
            
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-all"
            >
              <div>
                <div className="font-medium text-[#081F33]">Stripe Dashboard</div>
                <div className="text-sm text-[#4B5563]">Manage payments and products</div>
              </div>
              <ExternalLink className="w-5 h-5 text-[#9CA3AF]" />
            </a>
            
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-all"
            >
              <div>
                <div className="font-medium text-[#081F33]">Vercel Dashboard</div>
                <div className="text-sm text-[#4B5563]">Manage deployments and domains</div>
              </div>
              <ExternalLink className="w-5 h-5 text-[#9CA3AF]" />
            </a>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="bg-[#C96A2B] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#B55D24] transition-all"
        >
          <Save className="w-5 h-5" />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
