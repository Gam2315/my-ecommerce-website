import { getAdminClient } from '@/utils/supabase/admin';
import { cachedQuery, CACHE_KEYS, CACHE_TTL } from './cache';

type UserNameMap = Record<string, string>;

/**
 * Returns a cached map of userId → display name.
 * Fetches from Supabase auth.admin.listUsers() only on cache miss (every 5 min).
 * This replaces calling listUsers() on every page render.
 */
export async function getUserNameMap(): Promise<UserNameMap> {
  return cachedQuery<UserNameMap>(
    CACHE_KEYS.USER_PROFILES,
    async () => {
      const adminSupabase = getAdminClient();
      const { data: { users } } = await adminSupabase.auth.admin.listUsers();

      const map: UserNameMap = {};
      for (const user of users) {
        map[user.id] = user.user_metadata?.full_name
          || user.email?.split('@')[0]
          || 'Anonymous';
      }
      return map;
    },
    CACHE_TTL.USER_PROFILES
  );
}

/**
 * Enrich an array of ratings with user display names using the cached map.
 */
export async function enrichRatingsWithUserNames(
  ratings: any[],
  products?: any[]
): Promise<any[]> {
  if (ratings.length === 0) return [];

  const userNameMap = await getUserNameMap();

  return ratings.map((rating) => {
    const product = products?.find(
      (p: any) => p.id.toString() === rating.product_id?.toString()
    );

    return {
      ...rating,
      user_name: userNameMap[rating.user_id] || 'Verified Customer',
      ...(product ? { product_name: product.name } : {}),
    };
  });
}
