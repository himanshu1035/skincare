import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PRODUCTS_DIR = 'www.cosrx.com/products';
const COLLECTIONS_DIR = 'www.cosrx.com/collections';

// Helper to clean HTML noise
function cleanHtml(html) {
  if (!html) return "";
  return html
    .replace(/bis_size="[^"]*"/g, '')
    .replace(/abs_x="[^"]*"/g, '')
    .replace(/abs_y="[^"]*"/g, '')
    .replace(/style="user-select: auto;"/g, '')
    .replace(/bis_size='[^']*'/g, '')
    .replace(/style='user-select: auto;'/g, '')
    .replace(/\s{2,}/g, ' ') // Collapse spaces
    .trim();
}

async function seed() {
  console.log('🚀 Starting clean seed process...');

  // 1. Seed Collections
  const collectionFiles = fs.readdirSync(COLLECTIONS_DIR).filter(f => f.endsWith('.oembed'));
  const collectionMap = new Map();

  for (const file of collectionFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(COLLECTIONS_DIR, file), 'utf8'));
    const slug = file.replace('.oembed', '');
    
    const { data: collection, error } = await supabase
      .from('skin_collections')
      .upsert({
        skin_name: data.title,
        skin_slug: slug,
        skin_description: cleanHtml(data.description)
      }, { onConflict: 'skin_slug' })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error seeding collection ${slug}:`, error);
      continue;
    }
    
    collectionMap.set(slug, { id: collection.skin_id, products: data.products || [] });
  }

  // 2. Seed Products
  const productFiles = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.oembed'));
  const productMap = new Map();

  for (const file of productFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, file), 'utf8'));
    const slug = file.replace('.oembed', '');
    
    const firstOffer = data.offers?.[0] || {};
    const price = firstOffer.price || 0;

    const productData = {
      skin_name: data.title,
      skin_slug: slug,
      skin_description: cleanHtml(data.description),
      skin_brand: data.brand || 'COSRX',
      skin_price: price,
      skin_original_price: price,
      skin_image_url: data.thumbnail_url ? (data.thumbnail_url.startsWith('//') ? 'https:' + data.thumbnail_url : data.thumbnail_url) : '',
      skin_stock_count: 100
    };

    const { data: product, error: productError } = await supabase
      .from('skin_products')
      .upsert(productData, { onConflict: 'skin_slug' })
      .select()
      .single();

    if (productError) {
      console.error(`❌ Error seeding product ${slug}:`, productError);
      continue;
    }

    productMap.set(slug, product.skin_id);
  }

  // 3. Seed Collection-Product Relationships
  console.log('🔗 Linking products to collections...');
  for (const [colSlug, colData] of collectionMap.entries()) {
    const relations = [];
    for (const p of colData.products) {
      const productId = productMap.get(p.product_id);
      if (productId) {
        relations.push({
          skin_collection_id: colData.id,
          skin_product_id: productId
        });
      }
    }

    if (relations.length > 0) {
      await supabase
        .from('skin_collection_products')
        .upsert(relations, { onConflict: 'skin_collection_id,skin_product_id' });
    }
  }

  console.log('✨ Clean seed completed!');
}

seed().catch(console.error);
