'use client';

import { useState, useEffect } from 'react';
import { Save, ExternalLink, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    calendlyLink: 'https://calendly.com/brian-stroka22/30min',
    notificationEmail: '',
    adminPassword: '',
  });
  const [saved, setSaved] = useState(false);
  
  // Homepage branding images
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'before' | 'after' | null>(null);

  useEffect(() => {
    fetchBrandingImages();
  }, []);

  async function fetchBrandingImages() {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .in('key', ['homepage_before_image', 'homepage_after_image']);
    
    if (data) {
      data.forEach(item => {
        if (item.key === 'homepage_before_image') setBeforeImage(item.value);
        if (item.key === 'homepage_after_image') setAfterImage(item.value);
      });
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `homepage/${type}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage.from('Vault').upload(fileName, file);
    
    if (uploadError) {
      alert('Upload error: ' + uploadError.message);
      setUploading(null);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage.from('Vault').getPublicUrl(fileName);
    
    // Save to site_settings table
    const key = type === 'before' ? 'homepage_before_image' : 'homepage_after_image';
    const { error: dbError } = await supabase
      .from('site_settings')
      .upsert({ key, value: publicUrl }, { onConflict: 'key' });
    
    if (dbError) {
      alert('Database error: ' + dbError.message);
    } else {
      if (type === 'before') setBeforeImage(publicUrl);
      else setAfterImage(publicUrl);
    }
    
    setUploading(null);
    e.target.value = '';
  }

  async function removeImage(type: 'before' | 'after') {
    const key = type === 'before' ? 'homepage_before_image' : 'homepage_after_image';
    await supabase.from('site_settings').delete().eq('key', key);
    if (type === 'before') setBeforeImage(null);
    else setAfterImage(null);
  }

  const handleSave = () => {
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
        {/* Homepage Before/After Images */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-[#081F33] mb-2">Homepage Branding Tool Preview</h2>
          <p className="text-sm text-[#4B5563] mb-6">Upload before/after images to showcase the AI Branding Tool on the homepage</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before Image */}
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">Before Image</label>
              {beforeImage ? (
                <div className="relative aspect-square rounded-xl overflow-hidden border border-[#E5E7EB]">
                  <Image src={beforeImage} alt="Before" fill className="object-cover" />
                  <button
                    onClick={() => removeImage('before')}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-[#E5E7EB] rounded-xl cursor-pointer hover:border-[#C96A2B] transition-colors">
                  {uploading === 'before' ? (
                    <Loader2 className="w-8 h-8 text-[#C96A2B] animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[#9CA3AF] mb-2" />
                      <span className="text-sm text-[#4B5563]">Upload Before</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'before')}
                    className="hidden"
                    disabled={uploading !== null}
                  />
                </label>
              )}
            </div>
            
            {/* After Image */}
            <div>
              <label className="block text-sm font-medium text-[#081F33] mb-2">After Image (Branded)</label>
              {afterImage ? (
                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-purple-500">
                  <Image src={afterImage} alt="After" fill className="object-cover" />
                  <button
                    onClick={() => removeImage('after')}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:border-purple-500 transition-colors">
                  {uploading === 'after' ? (
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-purple-400 mb-2" />
                      <span className="text-sm text-[#4B5563]">Upload After</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'after')}
                    className="hidden"
                    disabled={uploading !== null}
                  />
                </label>
              )}
            </div>
          </div>
          
          <p className="text-xs text-[#9CA3AF] mt-4">
            Tip: Use a real example showing generic content transformed into branded content with your business name, phone, and website.
          </p>
        </div>

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
