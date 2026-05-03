'use client';

import { useEffect, useState } from 'react';
import { supabase, Order } from '@/lib/supabase';
import { Eye, Clock, Download, Mail } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }

  async function updateStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as Order['status'] });
      }
    }
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800 border-blue-200',
    waiting_for_info: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_production: 'bg-purple-100 text-purple-800 border-purple-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C96A2B]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#081F33]">Orders</h1>
          <p className="text-[#4B5563]">{orders.length} total orders</p>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="waiting_for_info">Waiting for Info</option>
          <option value="in_production">In Production</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-[#9CA3AF]">
              No orders found
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 cursor-pointer hover:bg-[#F9FAFB] transition-colors ${
                    selectedOrder?.id === order.id ? 'bg-[#F9FAFB] border-l-4 border-[#C96A2B]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-[#081F33]">{order.company_name}</div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[order.status]}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className="text-sm text-[#4B5563] mb-1">{order.product_title}</div>
                  <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-[#081F33]">${order.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {selectedOrder ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#081F33]">Order Details</h2>
                <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[selectedOrder.status]}`}>
                  {formatStatus(selectedOrder.status)}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Company</label>
                  <div className="font-medium text-[#081F33]">{selectedOrder.company_name}</div>
                </div>
                
                <div>
                  <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Buyer</label>
                  <div className="font-medium text-[#081F33]">{selectedOrder.buyer_name}</div>
                  <div className="text-sm text-[#4B5563]">{selectedOrder.buyer_email}</div>
                </div>
                
                <div>
                  <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Phone</label>
                  <div className="font-medium text-[#081F33]">{selectedOrder.phone_number}</div>
                </div>
                
                {selectedOrder.company_website && (
                  <div>
                    <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Website</label>
                    <div className="font-medium text-[#081F33]">{selectedOrder.company_website}</div>
                  </div>
                )}
                
                {selectedOrder.service_area && (
                  <div>
                    <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Service Area</label>
                    <div className="font-medium text-[#081F33]">{selectedOrder.service_area}</div>
                  </div>
                )}
                
                {selectedOrder.brand_colors && (
                  <div>
                    <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Brand Colors</label>
                    <div className="font-medium text-[#081F33]">{selectedOrder.brand_colors}</div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-[#E5E7EB]">
                  <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Product</label>
                  <div className="font-medium text-[#081F33]">{selectedOrder.product_title}</div>
                  <div className="text-lg font-bold text-[#C96A2B]">${selectedOrder.amount}</div>
                </div>
                
                {selectedOrder.notes && (
                  <div className="pt-4 border-t border-[#E5E7EB]">
                    <label className="text-xs text-[#9CA3AF] uppercase tracking-wide">Notes</label>
                    <div className="text-sm text-[#4B5563]">{selectedOrder.notes}</div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-[#E5E7EB]">
                  <label className="text-xs text-[#9CA3AF] uppercase tracking-wide mb-2 block">Update Status</label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C96A2B]"
                  >
                    <option value="new">New</option>
                    <option value="waiting_for_info">Waiting for Info</option>
                    <option value="in_production">In Production</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <a
                    href={`mailto:${selectedOrder.buyer_email}`}
                    className="flex-1 flex items-center justify-center gap-2 border border-[#E5E7EB] text-[#4B5563] py-2 rounded-lg hover:bg-[#F3F4F6] transition-all text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                  {selectedOrder.logo_url && (
                    <a
                      href={selectedOrder.logo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 border border-[#E5E7EB] text-[#4B5563] py-2 rounded-lg hover:bg-[#F3F4F6] transition-all text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Logo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-[#9CA3AF] py-12">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
