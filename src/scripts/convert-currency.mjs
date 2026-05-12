import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const USD_TO_INR_RATE = 83;

async function convertPrices() {
  console.log(`💱 Converting all product prices to INR (Rate: 1 USD = ${USD_TO_INR_RATE} INR)...`);

  // 1. Fetch all products
  const { data: products, error: fetchError } = await supabase
    .from('skin_products')
    .select('skin_id, skin_price, skin_original_price');

  if (fetchError) {
    console.error('❌ Error fetching products:', fetchError);
    return;
  }

  console.log(`📦 Found ${products.length} products. Updating...`);

  let updatedCount = 0;

  for (const product of products) {
    // Multiply by rate and round to a clean number (ending in 0 or 5 or just rounded)
    // We'll round to the nearest whole number for INR generally
    const newPrice = Math.round(product.skin_price * USD_TO_INR_RATE);
    const newOriginalPrice = product.skin_original_price ? Math.round(product.skin_original_price * USD_TO_INR_RATE) : newPrice;

    const { error: updateError } = await supabase
      .from('skin_products')
      .update({
        skin_price: newPrice,
        skin_original_price: newOriginalPrice
      })
      .eq('skin_id', product.skin_id);

    if (updateError) {
      console.error(`❌ Error updating product ${product.skin_id}:`, updateError);
    } else {
      updatedCount++;
      if (updatedCount % 10 === 0) console.log(`✅ Updated ${updatedCount} products...`);
    }
  }

  console.log(`✨ Successfully converted ${updatedCount} products to INR!`);
}

convertPrices().catch(console.error);
