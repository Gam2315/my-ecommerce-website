import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

        // Deduct stock for each item
        const items = order.items || [];
        for (const item of items) {
          const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('id', item.productId)
            .single();

          if (product) {
            if (item.size && product.sizes) {
              // Deduct from specific size
              const newSizes = { ...product.sizes };
              if (typeof newSizes[item.size] === 'number') {
                newSizes[item.size] = Math.max(0, newSizes[item.size] - item.quantity);
              }
              await supabase.from('products').update({ sizes: newSizes }).eq('id', product.id);
            } else {
              // Deduct from general stock
              const newStock = Math.max(0, (product.stock || 0) - item.quantity);
              const newStatus = newStock === 0 ? 'Out of Stock' : product.status;
              await supabase.from('products').update({ stock: newStock, status: newStatus }).eq('id', product.id);
            }
          }
        }

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
