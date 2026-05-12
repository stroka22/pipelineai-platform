'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return;

    // Get or create session ID to avoid duplicate counts on same visit
    let sessionId = sessionStorage.getItem('tracking_session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('tracking_session', sessionId);
    }

    // Check if we already tracked this page this session
    const trackedPages = JSON.parse(sessionStorage.getItem('tracked_pages') || '[]');
    if (trackedPages.includes(pathname)) return;

    // Track the page view
    async function trackView() {
      await supabase.from('page_views').insert({
        page_path: pathname,
        referrer: document.referrer || null,
      });

      // Mark as tracked for this session
      trackedPages.push(pathname);
      sessionStorage.setItem('tracked_pages', JSON.stringify(trackedPages));
    }

    trackView();
  }, [pathname]);

  return null;
}
