'use client';

import { useEffect, useState } from 'react';
import { supabase, Lead } from '@/lib/supabase';
import { Mail, Download, Clock, Trash2 } from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching leads:', error);
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  }

  async function deleteLead(id: string) {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    
    if (!error) {
      fetchLeads();
    }
  }

  function exportCSV() {
    const headers = ['Name', 'Email', 'Company', 'Website', 'Topic', 'Source', 'Date'];
    const rows = leads.map(l => [
      l.name,
      l.email,
      l.company || '',
      l.website || '',
      l.pest_topic || '',
      l.source,
      new Date(l.created_at).toLocaleDateString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

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
          <h1 className="text-2xl font-bold text-[#081F33]">Leads</h1>
          <p className="text-[#4B5563]">{leads.length} total leads</p>
        </div>
        
        {leads.length > 0 && (
          <button
            onClick={exportCSV}
            className="bg-[#081F33] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#0a2a47] transition-all"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3AF]">
            No leads yet. Leads will appear here when visitors submit the sample pack form.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-6 py-4 font-medium text-[#081F33]">{lead.name}</td>
                    <td className="px-6 py-4 text-[#4B5563]">{lead.email}</td>
                    <td className="px-6 py-4 text-[#4B5563]">{lead.company || '-'}</td>
                    <td className="px-6 py-4">
                      {lead.pest_topic && (
                        <span className="text-xs bg-[#C96A2B]/10 text-[#C96A2B] px-2 py-1 rounded-full">
                          {lead.pest_topic}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#9CA3AF] text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`mailto:${lead.email}`}
                          className="p-2 text-[#4B5563] hover:text-[#C96A2B] hover:bg-[#F3F4F6] rounded-lg transition-all"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-2 text-[#4B5563] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
