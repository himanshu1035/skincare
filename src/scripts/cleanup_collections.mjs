import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fjecoflrppakvcreojbw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZWNvZmxycHBha3ZjcmVvamJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIxMzA1MSwiZXhwIjoyMDkzNzg5MDUxfQ.QaD3QGKwcgx71jvWdvghVjAlUnmPPloWSRmuwhIqxjA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanupCollections() {
  console.log('Starting collection cleanup...');
  
  // 1. Delete redundant "Best Seller" collections (keeping 'best-sellers')
  const { error: delErr } = await supabase
    .from('skin_collections')
    .delete()
    .in('skin_slug', ['best', 'best-seller', 'popular']);

  if (delErr) console.error('Error deleting redundant collections:', delErr);
  else console.log('Deleted redundant collections.');

  // 2. Ensure 'best-sellers' is pinned and correctly named
  await supabase
    .from('skin_collections')
    .update({ skin_name: 'Best Sellers', skin_is_pinned: true })
    .eq('skin_slug', 'best-sellers');

  console.log('Cleanup complete!');
}

cleanupCollections();
