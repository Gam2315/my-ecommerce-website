import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { deductStock } from '@/lib/stockManager';

/**
 * Server-side API route for atomic stock deduction.
 * Called by the checkout page for COD orders.
 * Requires authentication to prevent abuse.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    const result = await deductStock(items);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Stock deduction API error:', error);
    return NextResponse.json(
      { error: 'Failed to deduct stock', success: false, failedItems: [] },
      { status: 500 }
    );
  }
}
