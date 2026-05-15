import { createClient } from '../lib/supabase.js';

async function listProducts() {
  const supabase = createClient();
  const { data, error } = await supabase.from('skin_products').select('skin_id, skin_name');
  if (error) {
    console.error(error);
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}

listProducts();
