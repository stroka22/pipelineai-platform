'use client';

import { useEffect, useState } from 'react';
import { supabase, Product, Order, Lead } from '@/lib/supabase';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalLeads: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch products count
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: activeProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch orders
      const { data: orders, count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);

      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['new', 'waiting_for_info', 'in_production']);

      // Calculate revenue
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;

      // Fetch leads
      const { data: leads, count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalLeads: totalLeads || 0,
        totalRevenue,
      });
      setRecentOrders(orders || []);
      setRecentLeads(leads || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { 
      name: 'Total Products', 
      value: stats.totalProducts, 
      subtext: `${stats.activeProducts} active`,
      icon: Package, 
      color: 'bg-blue-500',
      href: '/admin/products'
    },
    { 
      name: 'Total Orders', 
      value: stats.totalOrders, 
      subtext: `${stats.pendingOrders} pending`,
      icon: ShoppingCart, 
      color: 'bg-green-500',
      href: '/admin/orders'
    },
    { 
      name: 'Total Leads', 
      value: stats.totalLeads, 
      subtext: 'All time',
      icon: Users, 
      color: 'bg-purple-500',
      href: '/admin/leads'
    },
    { 
      name: 'Revenue', 
      value: `$${stats.totalRevenue.toLocaleString()}`, 
      subtext: 'From orders',
      icon: DollarSign, 
      color: 'bg-[#C96A2B]',
      href: '/admin/orders'
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      waiting_for_info: 'bg-yellow-100 text-yellow-800',
      in_production: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#081F33]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-[#C96A2B] hover:underline">
              View all
            </Link>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-[#9CA3AF] text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-[#081F33]">{order.company_name}</div>
                      <div className="text-sm text-[#4B5563]">{order.product_title}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#081F33]">${order.amount}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
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
