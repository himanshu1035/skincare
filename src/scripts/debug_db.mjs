import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listTables() {
  console.log('Checking for tables...');
  
  const tablesToCheck = ['skin_products', 'skin_collections', 'skin_variants', 'skin_orders'];
  
  for (const table of tablesToCheck) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table}: FAIL - ${error.message}`);
    } else {
      console.log(`Table ${table}: OK`);
    }
  }
}

listTables();
