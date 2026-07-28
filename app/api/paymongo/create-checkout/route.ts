import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, PayMongoLineItem } from '@/lib/paymongo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, orderId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Convert cart items to PayMongo line items (amounts in centavos)
    const line_items: PayMongoLineItem[] = items.map((item: any) => ({
      name: item.name + (item.size ? ` (Size: ${item.size})` : ''),
      quantity: item.quantity,
      amount: Math.round(item.price * 100), // Convert pesos to centavos
      currency: 'PHP',
      description: `Product ID: ${item.productId}`,
      images: item.image ? [item.image] : [],
    }));

    // Determine which payment methods to show based on selection
    const paymentMethodType = body.paymentMethodType || 'gcash';
    
    // Map our labels to PayMongo payment method types
    const paymentMethodMap: Record<string, string[]> = {
      'GCash': ['gcash'],
      'GrabPay': ['grab_pay'],
      'Maya': ['paymaya'],
      'Card': ['card'],
    };

    const payment_method_types = paymentMethodMap[paymentMethodType] || ['gcash', 'grab_pay', 'paymaya', 'card'];

    const session = await createCheckoutSession({
      line_items,
      payment_method_types,
      success_url: `${appUrl}/checkout/success?session_id={id}&order_id=${orderId}`,
      cancel_url: `${appUrl}/checkout`,
      description: `TRAFASHION Order #${orderId?.split('-')[0]?.toUpperCase() || 'NEW'}`,
      metadata: {
        order_id: orderId || '',
        customer_name: customer?.name || '',
        customer_email: customer?.email || '',
      },
    });

    return NextResponse.json({
      checkout_url: session.attributes.checkout_url,
      session_id: session.id,
    });
  } catch (error: any) {
    console.error('PayMongo Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
