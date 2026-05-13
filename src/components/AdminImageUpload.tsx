"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface AdminImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  dimensions?: string;
  className?: string;
}

export const AdminImageUpload: React.FC<AdminImageUploadProps> = ({ 
  value, 
  onChange, 
  label = "Upload Image", 
  dimensions = "1000x1000px recommended",
  className 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('skin_assets')
        .upload(filePath, file);

      if (error) {
        if (error.message.includes('bucket not found')) {
          // If bucket doesn't exist, we might need to instruct the user or use a public URL
          throw new Error('Supabase Storage bucket "skin_assets" not found. Please create it in your Supabase dashboard.');
        }
        throw error;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('skin_assets')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (error: any) {
      console.error('Error uploading:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</label>
        {dimensions && <span className="text-[10px] font-bold text-accent-gold italic">{dimensions}</span>}
      </div>

      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "relative aspect-square rounded-[2.5rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden group",
          value ? "border-accent-gold bg-accent-gold/5" : "border-secondary-ivory bg-secondary-ivory/50 hover:border-accent-gold hover:bg-white",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-accent-gold animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-accent-gold">Uploading...</p>
          </div>
        ) : value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-contain p-8 mix-blend-multiply" />
            <div className="absolute inset-0 bg-text-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-text-dark shadow-xl hover:scale-110 transition-transform">
                <Upload size={20} />
              </div>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); onChange(''); }} 
                className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform"
              >
                <X size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4 group-hover:scale-110 transition-transform duration-500">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto text-text-muted shadow-sm group-hover:shadow-md transition-shadow">
              <Upload size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-widest text-text-dark">Click to upload</p>
              <p className="text-[10px] font-medium text-text-muted">or drag and drop</p>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <ImageIcon size={14} className="text-text-muted" />
        </div>
        <input 
          type="url" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder="Or paste external image URL" 
          className="w-full bg-secondary-ivory/50 border-none rounded-2xl pl-10 pr-6 py-4 text-xs focus:ring-2 focus:ring-accent-gold outline-none font-medium" 
        />
      </div>
    </div>
  );
};
