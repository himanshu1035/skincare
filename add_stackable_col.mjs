import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { error } = await supabase.rpc('run_sql', {
    sql_query: "ALTER TABLE skin_marketer_settings ADD COLUMN IF NOT EXISTS skin_is_stackable_allowed BOOLEAN DEFAULT false;"
  });
  if (error) console.error("RPC failed:", error);
  else console.log("Added column successfully via RPC.");
}

main();
