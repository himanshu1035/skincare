import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role to bypass RLS for cancellation
    );

    // Only cancel if it's still 'under_review' or 'pending' and hasn't been finalized
    const { error } = await supabase
      .from('skin_orders')
      .update({ 
        skin_status: 'cancelled', 
        skin_payment_status: 'failed' 
      })
      .eq('skin_id', orderId)
      .neq('skin_payment_status', 'verified'); // Don't cancel if they actually paid

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Cancellation API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
