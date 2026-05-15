"use server";

import { createClient } from '@/lib/supabase'; // Assuming this can handle server-side if configured or create a new one
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Admin Service Client (Required for password updates)
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // This MUST be in your .env.local
  );
};

export async function updateCustomer(customerId: string, data: any) {
  const supabase = getAdminClient();
  
  // 1. Update Auth User (Email/Password)
  const updateData: any = {};
  if (data.email) updateData.email = data.email;
  if (data.password) updateData.password = data.password;
  
  if (Object.keys(updateData).length > 0) {
    const { error: authError } = await supabase.auth.admin.updateUserById(customerId, updateData);
    if (authError) throw authError;
  }

  // 2. Update Profile Table
  const { error: profileError } = await supabase
    .from('skin_user_profiles')
    .update({
      skin_first_name: data.firstName,
      skin_last_name: data.lastName,
      skin_username: `${data.firstName} ${data.lastName}`.trim(),
      skin_phone: data.phone,
      skin_role: data.role
    })
    .eq('skin_id', customerId);

  if (profileError) throw profileError;
  revalidatePath('/admin/customers');
  return { success: true };
}

export async function deleteCustomer(customerId: string) {
  const supabase = getAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(customerId);
  if (error) throw error;
  
  revalidatePath('/admin/customers');
  return { success: true };
}
