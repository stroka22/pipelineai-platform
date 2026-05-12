'use client';

import { useEffect, useState } from 'react';
import { supabase, VaultItem, Lead, Purchase } from '@/lib/supabase';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Clock, FolderLock, Eye, Globe } from 'lucide-react';
import Link from 'next/link';

interface PageViewStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  topPages: { page_path: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVaultItems: 0,
    activeVaultItems: 0,
    totalPurchases: 0,
    totalLeads: 0,
    totalRevenue: 0,
  });
  const [pageViews, setPageViews] = useState<PageViewStats>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    topPages: [],
    topReferrers: [],
  });
  const [recentPurchases, setRecentPurchases] = useState<(Purchase & { vault_item?: VaultItem })[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch vault items count
      const { count: totalVaultItems } = await supabase
        .from('vault_items')
        .select('*', { count: 'exact', head: true });

      const { count: activeVaultItems } = await supabase
        .from('vault_items')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch purchases with vault item info
      const { data: purchases, count: totalPurchases } = await supabase
        .from('purchases')
        .select('*, vault_item:vault_items(title, category)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate revenue from purchases
      const { data: allPurchases } = await supabase
        .from('purchases')
        .select('amount_paid');
      
      const totalRevenue = allPurchases?.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0) || 0;

      // Fetch leads
      const { data: leads, count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalVaultItems: totalVaultItems || 0,
        activeVaultItems: activeVaultItems || 0,
        totalPurchases: totalPurchases || 0,
        totalLeads: totalLeads || 0,
        totalRevenue,
      });
      setRecentPurchases(purchases || []);
      setRecentLeads(leads || []);

      // Fetch page view stats
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [todayViews, weekViews, monthViews, topPagesData, topReferrersData] = await Promise.all([
        supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
        supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', weekStart),
        supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', monthStart),
        supabase.from('page_views').select('page_path').gte('created_at', monthStart),
        supabase.from('page_views').select('referrer').gte('created_at', monthStart).not('referrer', 'is', null),
      ]);

      // Count top pages
      const pageCounts: Record<string, number> = {};
      topPagesData.data?.forEach(v => {
        pageCounts[v.page_path] = (pageCounts[v.page_path] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .map(([page_path, count]) => ({ page_path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Count top referrers
      const refCounts: Record<string, number> = {};
      topReferrersData.data?.forEach(v => {
        if (v.referrer) {
          try {
            const host = new URL(v.referrer).hostname.replace('www.', '');
            refCounts[host] = (refCounts[host] || 0) + 1;
          } catch {
            refCounts[v.referrer] = (refCounts[v.referrer] || 0) + 1;
          }
        }
      });
      const topReferrers = Object.entries(refCounts)
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setPageViews({
        today: todayViews.count || 0,
        thisWeek: weekViews.count || 0,
        thisMonth: monthViews.count || 0,
        topPages,
        topReferrers,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { 
      name: 'Page Views', 
      value: pageViews.thisMonth, 
      subtext: `${pageViews.today} today`,
      icon: Eye, 
      color: 'bg-indigo-500',
      href: '#traffic'
    },
    { 
      name: 'Vault Items', 
      value: stats.totalVaultItems, 
      subtext: `${stats.activeVaultItems} active`,
      icon: FolderLock, 
      color: 'bg-blue-500',
      href: '/admin/vault'
    },
    { 
      name: 'Purchases', 
      value: stats.totalPurchases, 
      subtext: 'All time',
      icon: ShoppingCart, 
      color: 'bg-green-500',
      href: '/admin/orders'
    },
    { 
      name: 'Revenue', 
      value: `$${stats.totalRevenue.toLocaleString()}`, 
      subtext: 'From purchases',
      icon: DollarSign, 
      color: 'bg-[#C96A2B]',
      href: '/admin/orders'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C96A2B]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#081F33]">Dashboard</h1>
        <p className="text-[#4B5563]">Welcome to Pipeline AI Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-[#081F33]">{stat.value}</div>
            <div className="text-sm text-[#4B5563]">{stat.name}</div>
            <div className="text-xs text-[#9CA3AF] mt-1">{stat.subtext}</div>
          </Link>
        ))}
      </div>

      {/* Traffic Stats */}
      <div id="traffic" className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Top Pages */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-[#E5E7EB]">
            <h2 className="text-lg font-semibold text-[#081F33]">Top Pages (This Month)</h2>
          </div>
          <div className="p-6">
            {pageViews.topPages.length === 0 ? (
              <p className="text-[#9CA3AF] text-center py-8">No page views yet</p>
            ) : (
              <div className="space-y-3">
                {pageViews.topPages.map((page, i) => (
                  <div key={page.page_path} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#9CA3AF] w-6">{i + 1}.</span>
                      <span className="text-[#081F33] font-medium truncate max-w-[200px]">{page.page_path}</span>
                    </div>
                    <span className="text-[#4B5563] font-semibold">{page.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-[#E5E7EB]">
            <h2 className="text-lg font-semibold text-[#081F33]">Top Referrers (This Month)</h2>
          </div>
          <div className="p-6">
            {pageViews.topReferrers.length === 0 ? (
              <p className="text-[#9CA3AF] text-center py-8">No referrer data yet</p>
            ) : (
              <div className="space-y-3">
                {pageViews.topReferrers.map((ref, i) => (
                  <div key={ref.referrer} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-[#9CA3AF]" />
                      <span className="text-[#081F33] font-medium">{ref.referrer}</span>
                    </div>
                    <span className="text-[#4B5563] font-semibold">{ref.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#081F33]">Recent Purchases</h2>
            <Link href="/admin/orders" className="text-sm text-[#C96A2B] hover:underline">
              View all
            </Link>
          </div>
          <div className="p-6">
            {recentPurchases.length === 0 ? (
              <p className="text-[#9CA3AF] text-center py-8">No purchases yet</p>
            ) : (
              <div className="space-y-4">
                {recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[#081F33]">
                        {(purchase.vault_item as any)?.title || 'Unknown Item'}
                      </div>
                      <div className="text-sm text-[#4B5563]">{purchase.customer_email}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#081F33]">${purchase.amount_paid}</div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#081F33]">Recent Leads</h2>
            <Link href="/admin/leads" className="text-sm text-[#C96A2B] hover:underline">
              View all
            </Link>
          </div>
          <div className="p-6">
            {recentLeads.length === 0 ? (
              <p className="text-[#9CA3AF] text-center py-8">No leads yet</p>
            ) : (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[#081F33]">{lead.name}</div>
                      <div className="text-sm text-[#4B5563]">{lead.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#4B5563]">{lead.company || '-'}</div>
                      <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                        <Clock className="w-3 h-3" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
