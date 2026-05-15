import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fjecoflrppakvcreojbw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZWNvZmxycHBha3ZjcmVvamJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIxMzA1MSwiZXhwIjoyMDkzNzg5MDUxfQ.QaD3QGKwcgx71jvWdvghVjAlUnmPPloWSRmuwhIqxjA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function finalFixImages() {
  console.log('Fetching all collections...');
  const { data: cols } = await supabase.from('skin_collections').select('*');
  
  if (!cols) return;

  const images = [
    'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop'
  ];

  console.log(`Processing ${cols.length} collections...`);
  
  for (let i = 0; i < cols.length; i++) {
    const col = cols[i];
    // Assign a unique image based on index to guarantee no duplicates
    const newImage = images[i % images.length];
    
    console.log(`Updating ${col.skin_name} (${col.skin_slug}) with unique image...`);
    
    const { error } = await supabase
      .from('skin_collections')
      .update({ skin_image_url: newImage })
      .eq('skin_id', col.skin_id);

    if (error) console.error('Error:', error);
  }

  console.log('All collections updated with unique images!');
}

finalFixImages();
