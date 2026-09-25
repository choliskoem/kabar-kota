import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Client tanpa cookie untuk halaman publik. Karena tidak membaca cookie,
 * halaman tetap bisa dirender statis (ISR) dan hanya melihat data yang publik.
 */
export function createPublicSupabase() {
  return createClient(env.supabaseUrl, env.supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
