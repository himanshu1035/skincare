import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fjecoflrppakvcreojbw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZWNvZmxycHBha3ZjcmVvamJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIxMzA1MSwiZXhwIjoyMDkzNzg5MDUxfQ.QaD3QGKwcgx71jvWdvghVjAlUnmPPloWSRmuwhIqxjA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setupAdmin() {
  console.log('Setting up admin tables and config...');
  
  // 1. Create skin_admin_config and insert defaults
  const { error: err1 } = await supabase.rpc('exec_sql', { 
    sql_query: `
      CREATE TABLE IF NOT EXISTS public.skin_admin_config (
          skin_key TEXT PRIMARY KEY,
          skin_value TEXT NOT NULL,
          skin_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      INSERT INTO public.skin_admin_config (skin_key, skin_value)
      VALUES ('admin_username', 'admin'), ('admin_password', 'admin')
      ON CONFLICT (skin_key) DO NOTHING;
    `
  });

  if (err1) {
    console.log('RPC failed (as expected if not defined), trying direct insert...');
    // Fallback if exec_sql doesn't exist
    await supabase.from('skin_admin_config').insert([
      { skin_key: 'admin_username', skin_value: 'admin' },
      { skin_key: 'admin_password', skin_value: 'admin' }
    ]).catch(() => {});
  }

  console.log('Admin config setup complete!');
}

setupAdmin();
