import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/** Client untuk komponen di browser (mis. unggah gambar). Sesi dibaca dari cookie. */
export function createBrowserSupabase() {
  return createBrowserClient(env.supabaseUrl, env.supabaseKey);
}
