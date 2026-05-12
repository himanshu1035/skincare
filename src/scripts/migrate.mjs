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

async function pushDatabase() {
  console.log('🚀 Pushing database schema...');

  const schemaPath = 'src/lib/schema.sql';
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Please copy the following SQL into your Supabase SQL Editor and run it:');
  console.log('\n--- START SQL ---\n');
  console.log(sql);
  console.log('\n--- END SQL ---\n');
  
  console.log('Note: Direct SQL execution via Anon Key is restricted by Supabase for security.');
  console.log('Once you run the SQL in the dashboard, your database will be fully updated.');
}

pushDatabase().catch(console.error);
