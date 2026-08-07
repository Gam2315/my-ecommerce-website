import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deductStock } from '@/lib/stockManager';
import { invalidateCache, CACHE_KEYS } from '@/lib/cache';

// Use the service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body?.data;

    if (!event) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const eventType = event?.attributes?.type;
    const resourceData = event?.attributes?.data;

    console.log('PayMongo Webhook Event:', eventType);

    if (
      eventType === 'checkout_session.payment.paid' ||
      eventType === 'payment.paid'
    ) {
      // Extract the order_id from the metadata
      const metadata = resourceData?.attributes?.metadata || {};
      const orderId = metadata.order_id;

      if (!orderId) {
        console.warn('No order_id in webhook metadata, skipping.');
        return NextResponse.json({ received: true });
      }

      // Update order status to 'Processing' (payment confirmed)
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) {
        console.error('Order not found for webhook:', orderId, fetchError);
        return NextResponse.json({ received: true });
      }

      // Only process if the order is still awaiting payment
      if (order.status === 'Awaiting Payment') {
        // Update order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'Processing',
            payment_status: 'paid',
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('Failed to update order status:', updateError);
        }

        // Deduct stock atomically using the stock manager
        const items = order.items || [];
        const result = await deductStock(items);

        if (!result.success) {
          console.warn('Some items failed stock deduction:', result.failedItems);
        }

        // Invalidate products cache after stock changes
        await invalidateCache(CACHE_KEYS.ALL_PRODUCTS);

        console.log(`Order ${orderId} payment confirmed, stock deducted.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

