import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser/anon client. Safe to use in client components for reads that are
// protected by RLS. Most of Voyagent's reads happen server-side via the
// service client; this exists for any client-side data needs.
let cached: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  cached = createClient(url, anonKey);
  return cached;
}
