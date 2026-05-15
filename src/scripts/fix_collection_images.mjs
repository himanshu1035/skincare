import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fjecoflrppakvcreojbw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZWNvZmxycHBha3ZjcmVvamJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIxMzA1MSwiZXhwIjoyMDkzNzg5MDUxfQ.QaD3QGKwcgx71jvWdvghVjAlUnmPPloWSRmuwhIqxjA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateCollectionImages() {
  console.log('Updating collection images...');
  
  const updates = [
    { 
      slug: 'best-selling-kits', 
      image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop' // Gift set look
    },
    { 
      slug: 'hydration-heroes', 
      image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800&auto=format&fit=crop' // Blue/Water look
    },
    { 
      slug: 'best-sellers', 
      image: 'https://images.unsplash.com/photo-1594465919760-441fe5908ab0?q=80&w=800&auto=format&fit=crop' // Trophy/Star look
    },
    { 
      slug: 'snail-mucin-essentials', 
      image: 'https://images.unsplash.com/photo-1556228515-28db2536583f?q=80&w=800&auto=format&fit=crop' // Clean skincare look
    }
  ];

  for (const update of updates) {
    const { error } = await supabase
      .from('skin_collections')
      .update({ skin_image_url: update.image })
      .eq('skin_slug', update.slug);
    
    if (error) console.error(`Error updating ${update.slug}:`, error);
    else console.log(`Updated ${update.slug}`);
  }

  console.log('Update complete!');
}

updateCollectionImages();
