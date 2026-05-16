"use server";

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Admin Service Client (Required for auth management)
const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function createMarketerAction(formData: any) {
  try {
    const supabase = getAdminClient();
    
    // 1. Create Auth User directly as an Admin
    // This avoids standard signup triggers and allows immediate confirmation
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: { role: 'marketer', name: formData.name }
    });

    if (authError) {
      console.error("Auth Admin Create Error:", authError);
      return { success: false, error: authError.message };
    }

    const userId = authData.user.id;

    // 2. Insert into Marketer Table
    const { error: marketerError } = await supabase
      .from('skin_marketers')
      .insert({
        skin_id: userId,
        skin_name: formData.name,
        skin_email: formData.email,
        skin_phone: formData.phone,
        skin_commission_percent: formData.commission,
        skin_fixed_bonus: formData.bonus,
        skin_default_discount: formData.defaultDiscount,
        skin_coupon_duration_days: formData.validityDays,
        skin_is_one_time_use: formData.isOneTimeUse,
        skin_code_length: formData.codeLength,
        skin_level: formData.level,
        skin_is_active: true
      });

    if (marketerError) {
      // Cleanup auth user if profile insertion fails
      await supabase.auth.admin.deleteUser(userId);
      return { success: false, error: marketerError.message };
    }

    // 3. IMPORTANT: Explicitly ensure they DON'T exist in skin_user_profiles 
    // (In case a trigger added them automatically)
    await supabase.from('skin_user_profiles').delete().eq('skin_id', userId);

    revalidatePath('/admin/marketers');
    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMarketerAction(id: string) {
  try {
    const supabase = getAdminClient();
    
    // 1. Delete from Marketer Table
    const { error: tableError } = await supabase
      .from('skin_marketers')
      .delete()
      .eq('skin_id', id);
    
    if (tableError) throw tableError;

    // 2. Delete from Profile Table (Just in case)
    await supabase.from('skin_user_profiles').delete().eq('skin_id', id);

    // 3. Delete from Auth Users (Freem up email for re-registration)
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) {
      console.warn("Auth User Delete Warning:", authError.message);
      // We don't throw here because the profile is already gone, 
      // but the user might have already been deleted or something else happened.
    }

    revalidatePath('/admin/marketers');
    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
