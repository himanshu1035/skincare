import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function check() {
  const { data, error } = await supabase.from('skin_orders').select('*').limit(1)
  console.log('Columns:', data ? Object.keys(data[0]) : 'None')
}

check()
