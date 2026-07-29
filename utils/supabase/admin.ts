import { createClient } from '@supabase/supabase-js'

let adminClient: ReturnType<typeof createClient> | null = null;

/**
 * Returns a singleton Supabase admin client that uses the service role key.
 * This bypasses RLS and should only be used in server-side code.
 * Reuses the same instance across requests to avoid repeated initialization.
 */
export function getAdminClient() {
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return adminClient;
}
