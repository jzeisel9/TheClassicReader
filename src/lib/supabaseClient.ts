import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function readBrowserConfig(): { url: string; anonKey: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const anonKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  if (!url || !anonKey) return null
  return { url, anonKey }
}

const cfg = readBrowserConfig()

/**
 * Browser Supabase client, or `null` if URL / public key are not set (e.g. CI
 * build without `.env.local`). Use `requireSupabase()` when the feature must
 * be configured.
 */
export const supabase: SupabaseClient | null = cfg
  ? createClient(cfg.url, cfg.anonKey)
  : null

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in .env.local — see .env.example',
    )
  }
  return supabase
}
