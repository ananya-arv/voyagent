// NOTE: no `server-only` guard here — this module is bundled by the Eve agent
// runtime (which has no React Server Components boundary). It is only imported
// from server contexts (route handlers, server components, Eve tools).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role client for server-side reads/writes. NEVER import this into a
// client component — the service-role key bypasses row-level security.
let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
