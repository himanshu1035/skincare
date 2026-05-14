import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const anonClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRLS() {
  const userId = '8c8aab42-0f70-4c05-8ecb-3cbffa6231cb';
  console.log(`Testing orders for UserID: ${userId}`);

  const { data: anonData, error: anonError } = await anonClient
    .from('skin_orders')
    .select('*')
    .eq('skin_user_id', userId);

  console.log('Anon client results:', anonData ? anonData.length : 'Error', anonError || '');

  const { data: serviceData, error: serviceError } = await serviceClient
    .from('skin_orders')
    .select('*')
    .eq('skin_user_id', userId);

  console.log('Service client results:', serviceData ? serviceData.length : 'Error', serviceError || '');
}

testRLS();
