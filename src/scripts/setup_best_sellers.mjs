import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fjecoflrppakvcreojbw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZWNvZmxycHBha3ZjcmVvamJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIxMzA1MSwiZXhwIjoyMDkzNzg5MDUxfQ.QaD3QGKwcgx71jvWdvghVjAlUnmPPloWSRmuwhIqxjA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setupBestSellers() {
  console.log('Fetching products...');
  const { data: products } = await supabase.from('skin_products').select('skin_id, skin_name');
  if (!products) return;

  // 1. Create Best Sellers Collection
  const { data: coll, error: collErr } = await supabase
    .from('skin_collections')
    .upsert({ 
      skin_name: 'Best Sellers', 
      skin_slug: 'best-sellers', 
      skin_description: 'Discover our most-loved, award-winning skincare essentials.',
      skin_image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop',
      skin_is_pinned: true
    }, { onConflict: 'skin_slug' })
    .select()
    .single();

  if (collErr) return console.error(collErr);

  // 2. Define Best Sellers in order
  const bestSellerNames = [
    'Advanced Snail 96 Mucin Power Essence',
    'Low pH Good Morning Gel Cleanser',
    'Advanced Snail 92 All In One Cream',
    'Salicylic Acid Daily Gentle Cleanser',
    'AHA/BHA Clarifying Treatment Toner',
    'The Vitamin C 23 Serum',
    'Aloe Soothing Sun Cream',
    'Oil-Free Ultra-Moisturizing Lotion',
    'Master Patch Original Fit',
    'Ultimate Nourishing Rice Overnight Spa Mask'
  ];

  const links = [];
  for (let i = 0; i < bestSellerNames.length; i++) {
    const name = bestSellerNames[i];
    const product = products.find(p => p.skin_name.toLowerCase().includes(name.toLowerCase()));
    if (product) {
      links.push({
        skin_collection_id: coll.skin_id,
        skin_product_id: product.skin_id,
        // Using a sort order if available, or just relying on insertion order if the UI supports it.
        // Assuming we might need a custom sort column in skin_collection_products.
      });
    }
  }

  if (links.length > 0) {
    await supabase.from('skin_collection_products').upsert(links, { onConflict: 'skin_collection_id,skin_product_id' });
    console.log(`Linked ${links.length} best sellers!`);
  }
}

setupBestSellers();
