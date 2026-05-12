"use client";

import React, { useState } from 'react';
import { Layers, ChevronDown, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';

interface Collection {
  skin_id: string;
  skin_name: string;
  skin_slug: string;
}

export const QuickCollectionSelect = ({ collections }: { collections: Collection[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-xs tracking-widest hover:border-black hover:shadow-md transition-all uppercase"
      >
        <Layers size={16} className="text-gray-400" />
        Quick Select Collection
        <ChevronDown size={14} className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-3 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Collections</p>
            </div>
            <div className="max-h-80 overflow-y-auto py-2">
              {collections.map((col) => (
                <Link 
                  key={col.skin_id} 
                  href={`/admin/collections/${col.skin_id}/assign`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Tag size={14} className="text-gray-300 group-hover:text-black" />
                    <span className="text-xs font-bold text-gray-700 group-hover:text-black">{col.skin_name}</span>
                  </div>
                  <ArrowRight size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
              {collections.length === 0 && (
                <div className="p-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  No collections found
                </div>
              )}
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <Link 
                href="/admin/collections" 
                className="block text-center text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest"
                onClick={() => setIsOpen(false)}
              >
                Manage All Collections
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
