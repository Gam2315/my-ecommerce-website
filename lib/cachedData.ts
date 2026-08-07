import { getAdminClient } from '@/utils/supabase/admin';
import { cachedQuery, CACHE_KEYS, CACHE_TTL } from './cache';

/**
 * Fetch all products with Redis caching (TTL: 2 min).
 * Uses the admin client to bypass RLS.
 */
export async function getCachedProducts(): Promise<any[]> {
  return cachedQuery<any[]>(
    CACHE_KEYS.ALL_PRODUCTS,
    async () => {
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('[CachedData] Products fetch error:', error);
        return [];
      }
      return data || [];
    },
    CACHE_TTL.PRODUCTS
  );
}

/**
 * Fetch active discounts with Redis caching (TTL: 1 min).
 */
export async function getCachedActiveDiscounts(): Promise<any[]> {
  return cachedQuery<any[]>(
    CACHE_KEYS.ACTIVE_DISCOUNTS,
    async () => {
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from('discounts')
        .select('id, name, type, value, active, expiry_date, applies_to, product_ids')
        .eq('active', true)
        .or(`expiry_date.is.null,expiry_date.gte.${new Date().toISOString()}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[CachedData] Discounts fetch error:', error);
        return [];
      }
      return data || [];
    },
    CACHE_TTL.DISCOUNTS
  );
}

/**
 * Fetch all ratings with Redis caching (TTL: 2 min).
 */
export async function getCachedAllRatings(): Promise<any[]> {
  return cachedQuery<any[]>(
    CACHE_KEYS.ALL_RATINGS,
    async () => {
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from('product_ratings')
        .select('rating, review_text, created_at, user_id, product_id')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[CachedData] Ratings fetch error:', error);
        return [];
      }
      return data || [];
    },
    CACHE_TTL.RATINGS
  );
}

/**
 * Fetch ratings for a specific product with Redis caching (TTL: 2 min).
 */
export async function getCachedProductRatings(productId: string): Promise<any[]> {
  return cachedQuery<any[]>(
    CACHE_KEYS.PRODUCT_RATINGS(productId),
    async () => {
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from('product_ratings')
        .select('*')
        .eq('product_id', productId);

      if (error) {
        console.error(`[CachedData] Product ratings fetch error for ${productId}:`, error);
        return [];
      }
      return data || [];
    },
    CACHE_TTL.RATINGS
  );
}

/**
 * Fetch orders for best-sellers calculation with Redis caching (TTL: 3 min).
 * Only fetches the `items` column, limited to recent fulfilled orders.
 */
export async function getCachedOrdersForBestsellers(): Promise<any[]> {
  return cachedQuery<any[]>(
    CACHE_KEYS.ORDERS_FOR_BESTSELLERS,
    async () => {
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from('orders')
        .select('items')
        .in('status', ['Delivered', 'Completed', 'Shipped', 'Processing', 'Pending'])
        .limit(500);

      if (error) {
        console.error('[CachedData] Orders fetch error:', error);
        return [];
      }
      return data || [];
    },
    CACHE_TTL.ORDERS
  );
}
