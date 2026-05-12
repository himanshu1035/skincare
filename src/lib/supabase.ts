import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Re-using the environment variables with strict validation
const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // In development, we warn. In production, we provide clear context.
    if (process.env.NODE_ENV === 'production') {
       console.error("CRITICAL: Supabase environment variables are missing on Vercel.");
    }
    return { 
      url: url || 'https://fjecoflrppakvcreojbw.supabase.co', 
      key: key || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZWNvZmxycHBha3ZjcmVvamJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTMwNTEsImV4cCI6MjA5Mzc4OTA1MX0.2mSWt_w_knKQZ5VhAA_OcXMvIGODmi0SX9mIxmvzpLU'
    };
  }

  return { url, key };
};

const config = getSupabaseConfig();

// Global single instance for efficiency
export const supabase = createSupabaseClient(config.url, config.key);

// Helpers for different component types
export const createClient = () => createSupabaseClient(config.url, config.key);
export const createClientComponentClient = () => supabase;
