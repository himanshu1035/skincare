"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  ShoppingBag,
  ExternalLink,
  Shield,
  Edit2
} from 'lucide-react';
import { CustomerEditModal } from './CustomerEditModal';

interface CustomerTableProps {
  customers: any[];
}

export const CustomerTable = ({ customers }: CustomerTableProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  return (
    <>
      <div className="bg-white rounded-[3rem] shadow-sm border border-secondary-ivory overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary-ivory/30 border-b border-secondary-ivory">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Account</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Contact Info</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Role</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Orders</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted">Joined</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-ivory">
              {customers?.map((customer) => (
                <tr key={customer.skin_id} className="hover:bg-secondary-ivory/10 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-text-dark flex items-center justify-center text-white font-black shadow-lg">
                        {customer.skin_email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-text-dark text-sm truncate max-w-[200px]">
                            {customer.skin_first_name} {customer.skin_last_name}
                        </p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{customer.skin_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 text-xs font-bold text-text-dark">
                        <Mail size={12} className="text-text-muted" /> {customer.skin_email}
                      </p>
                      <p className="flex items-center gap-2 text-[10px] font-bold text-text-muted">
                        <Phone size={12} className="text-text-muted" /> {customer.skin_phone || 'No Mobile'}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${
                        customer.skin_role === 'admin' ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      <Shield size={10} /> {customer.skin_role || 'Customer'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 font-black text-sm text-text-dark">
                      <ShoppingBag size={14} className="text-text-muted" /> {customer.skin_orders?.[0]?.count || 0}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                      <Calendar size={12} /> {new Date(customer.skin_created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2.5 bg-secondary-ivory/50 rounded-xl text-text-muted hover:text-accent-gold hover:bg-white hover:shadow-md transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <CustomerEditModal 
          customer={selectedCustomer} 
          onClose={() => setSelectedCustomer(null)} 
        />
      )}
    </>
  );
};
