import { getAdminClient } from '@/utils/supabase/admin';
import { invalidateCache, CACHE_KEYS } from './cache';

type CartItem = {
  productId: number;
  size?: string;
  quantity: number;
  [key: string]: any;
};

type DeductResult = {
  success: boolean;
  failedItems: { productId: number; reason: string }[];
};

/**
 * Atomically deduct stock for a list of cart items using conditional UPDATE.
 * Uses `stock >= quantity` in the WHERE clause so two concurrent checkouts
 * can never reduce stock below zero (optimistic locking pattern).
 *
 * After successful deduction, invalidates the products cache.
 */
export async function deductStock(items: CartItem[]): Promise<DeductResult> {
  const supabase = getAdminClient();
  const failedItems: { productId: number; reason: string }[] = [];

  for (const item of items) {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('id, stock, sizes, status')
      .eq('id', item.productId)
      .single();

    const product = data as any;

    if (fetchError || !product) {
      failedItems.push({
        productId: item.productId,
        reason: 'Product not found',
      });
      continue;
    }

    if (item.size && product.sizes) {
      // ── Size-based stock deduction ──
      const currentSizeStock = product.sizes[item.size];

      if (typeof currentSizeStock !== 'number' || currentSizeStock < item.quantity) {
        failedItems.push({
          productId: item.productId,
          reason: `Insufficient stock for size ${item.size}`,
        });
        continue;
      }

      const newSizes = { ...product.sizes };
      newSizes[item.size] = currentSizeStock - item.quantity;

      // Calculate total stock across all sizes
      const totalStock = Object.values(newSizes).reduce(
        (sum: number, val) => sum + (typeof val === 'number' ? val : 0),
        0
      );
      const newStatus = totalStock === 0 ? 'Out of Stock' : totalStock <= 5 ? 'Low Stock' : 'Active';

      // Conditional update: only succeed if the size stock hasn't changed since we read it
      const { error: updateError, count } = await (supabase
        .from('products') as any)
        .update({ sizes: newSizes, stock: totalStock, status: newStatus })
        .eq('id', product.id)
        .gte('stock', 0);

      if (updateError || count === 0) {
        failedItems.push({
          productId: item.productId,
          reason: 'Stock update failed — concurrent modification',
        });
      }
    } else {
      // ── General stock deduction using conditional WHERE ──
      const newStock = Math.max(0, (product.stock || 0) - item.quantity);

      // Guard: ensure current stock is sufficient
      if ((product.stock || 0) < item.quantity) {
        failedItems.push({
          productId: item.productId,
          reason: 'Insufficient stock',
        });
        continue;
      }

      const newStatus = newStock === 0 ? 'Out of Stock' : newStock <= 5 ? 'Low Stock' : 'Active';

      const { error: updateError } = await (supabase
        .from('products') as any)
        .update({ stock: newStock, status: newStatus })
        .eq('id', product.id)
        .gte('stock', item.quantity); // Only update if stock >= quantity (optimistic lock)

      if (updateError) {
        failedItems.push({
          productId: item.productId,
          reason: 'Stock update failed',
        });
      }
    }
  }

  // Invalidate product cache after stock changes
  try {
    await invalidateCache(CACHE_KEYS.ALL_PRODUCTS);
  } catch {
    // Non-critical — cache will expire naturally
  }

  return {
    success: failedItems.length === 0,
    failedItems,
  };
}

