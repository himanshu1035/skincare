import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugOrders() {
  console.log('Fetching last 10 orders...');
  const { data, error } = await supabase
    .from('skin_orders')
    .select('skin_id, skin_user_id, skin_status, skin_created_at, skin_customer_email')
    .order('skin_created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }

  console.log('Recent Orders:');
  data.forEach(order => {
    console.log(`ID: ${order.skin_id} | UserID: ${order.skin_user_id} | Email: ${order.skin_customer_email} | Status: ${order.skin_status} | Created: ${order.skin_created_at}`);
  });

  const { count, error: countError } = await supabase
    .from('skin_orders')
    .select('*', { count: 'exact', head: true })
    .is('skin_user_id', null);

  if (!countError) {
    console.log(`\nTotal orders with NULL UserID: ${count}`);
  }
}

debugOrders();
