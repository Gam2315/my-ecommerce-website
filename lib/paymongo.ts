/**
 * PayMongo API Helper
 * Uses the PayMongo REST API with Basic Auth (base64-encoded secret key).
 * Docs: https://developers.paymongo.com/reference
 */

const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

function getAuthHeader() {
  const secretKey = process.env.PAYMONGO_SECRET_KEY!;
  const encoded = Buffer.from(`${secretKey}:`).toString('base64');
  return `Basic ${encoded}`;
}

export type PayMongoLineItem = {
  name: string;
  quantity: number;
  amount: number; // in centavos (e.g. ₱100.00 = 10000)
  currency: string;
  description?: string;
  images?: string[];
};

export type CreateCheckoutSessionParams = {
  line_items: PayMongoLineItem[];
  payment_method_types: string[];
  success_url: string;
  cancel_url: string;
  description?: string;
  metadata?: Record<string, string>;
};

/**
 * Create a PayMongo Checkout Session.
 * Returns the full checkout session object including the checkout_url.
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const response = await fetch(`${PAYMONGO_API_URL}/checkout_sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getAuthHeader(),
    },
    body: JSON.stringify({
      data: {
        attributes: {
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          line_items: params.line_items,
          payment_method_types: params.payment_method_types,
          success_url: params.success_url,
          cancel_url: params.cancel_url,
          description: params.description || 'TRAFASHION Order',
          metadata: params.metadata || {},
        },
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('PayMongo API Error:', JSON.stringify(errorData, null, 2));
    throw new Error(
      errorData?.errors?.[0]?.detail || 'Failed to create PayMongo checkout session'
    );
  }

  const data = await response.json();
  return data.data;
}

/**
 * Retrieve a PayMongo Checkout Session by ID.
 */
export async function retrieveCheckoutSession(sessionId: string) {
  const response = await fetch(`${PAYMONGO_API_URL}/checkout_sessions/${sessionId}`, {
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(),
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData?.errors?.[0]?.detail || 'Failed to retrieve checkout session'
    );
  }

  const data = await response.json();
  return data.data;
}

/**
 * Retrieve a PayMongo Payment by ID.
 */
export async function retrievePayment(paymentId: string) {
  const response = await fetch(`${PAYMONGO_API_URL}/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(),
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData?.errors?.[0]?.detail || 'Failed to retrieve payment'
    );
  }

  const data = await response.json();
  return data.data;
}
