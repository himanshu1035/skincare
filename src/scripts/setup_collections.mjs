import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fjecoflrppakvcreojbw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZWNvZmxycHBha3ZjcmVvamJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIxMzA1MSwiZXhwIjoyMDkzNzg5MDUxfQ.QaD3QGKwcgx71jvWdvghVjAlUnmPPloWSRmuwhIqxjA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setupCollections() {
  console.log('Fetching products...');
  const { data: products } = await supabase.from('skin_products').select('skin_id, skin_name');
  if (!products) return;

  const collections = [
    { name: 'Snail Mucin Essentials', slug: 'snail-mucin', desc: 'Experience the healing power of COSRX\'s world-famous Snail Mucin line.', keywords: ['Snail', 'Mucin'] },
    { name: 'Blemish & Acne Care', slug: 'acne-care', desc: 'Targeted solutions for troubled skin, featuring the AC Collection and Master Patches.', keywords: ['AC Collection', 'Acne', 'Patch', 'Blemish', 'Salicylic'] },
    { name: 'Sun Protection Hub', slug: 'sunscreen', desc: 'Weightless, invisible, and high-protection sunscreens for every skin type.', keywords: ['Sunscreen', 'Sun Stick'] },
    { name: 'The Vitamin Line', slug: 'vitamin-line', desc: 'High-concentration Vitamin C, E, and Retinol serums for radiant, youthful skin.', keywords: ['Vitamin C', 'Vitamin E', 'Retinol'] },
    { name: 'Hydration Heroes', slug: 'hydration', desc: 'Deep moisture and skin barrier support with Hyaluronic Acid and Ceramides.', keywords: ['Hyaluronic', 'Hydrium', 'Moisturizer', 'Cream', 'Ceramide', 'Aqua'] },
    { name: 'Cleanse & Prep', slug: 'cleansers', desc: 'Gentle yet effective cleansers and toners to prepare your skin for its routine.', keywords: ['Cleanser', 'Toner', 'Wash', 'Soap', 'Oil'] },
    { name: 'The Peptide Series', slug: 'peptides', desc: 'Advanced peptide formulas to boost skin elasticity and natural glow.', keywords: ['Peptide'] },
    { name: 'Best Selling Kits', slug: 'kits', desc: 'Curated skincare sets for specific concerns. Perfect for travel or starting a new routine.', keywords: ['Kit', 'Duo', 'Routine'] },
  ];

  for (const coll of collections) {
    console.log(`Creating collection: ${coll.name}`);
    
    // 1. Create or Get Collection
    const { data: newColl, error: collErr } = await supabase
      .from('skin_collections')
      .upsert({ 
        skin_name: coll.name, 
        skin_slug: coll.slug, 
        skin_description: coll.desc,
        skin_image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000&auto=format&fit=crop'
      }, { onConflict: 'skin_slug' })
      .select()
      .single();

    if (collErr) {
      console.error(`Error creating ${coll.name}:`, collErr);
      continue;
    }

    // 2. Find matching products
    const matchingProducts = products.filter(p => 
      coll.keywords.some(k => p.skin_name.toLowerCase().includes(k.toLowerCase()))
    );

    if (matchingProducts.length > 0) {
      console.log(`Linking ${matchingProducts.length} products to ${coll.name}`);
      const links = matchingProducts.map(p => ({
        skin_collection_id: newColl.skin_id,
        skin_product_id: p.skin_id
      }));

      const { error: linkErr } = await supabase
        .from('skin_collection_products')
        .upsert(links, { onConflict: 'skin_collection_id,skin_product_id' });

      if (linkErr) console.error(`Error linking products to ${coll.name}:`, linkErr);
    }
  }

  console.log('Collections setup complete!');
}

setupCollections();
