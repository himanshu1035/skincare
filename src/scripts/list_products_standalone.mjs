import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fjecoflrppakvcreojbw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZWNvZmxycHBha3ZjcmVvamJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIxMzA1MSwiZXhwIjoyMDkzNzg5MDUxfQ.QaD3QGKwcgx71jvWdvghVjAlUnmPPloWSRmuwhIqxjA';

async function listProducts() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data, error } = await supabase.from('skin_products').select('skin_id, skin_name');
  if (error) {
    console.error(error);
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}

listProducts();
