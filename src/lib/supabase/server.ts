import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/** Client untuk Server Component & Server Action yang butuh sesi pengguna. */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Dipanggil dari Server Component yang tidak boleh menulis cookie.
          // Aman diabaikan karena proxy.ts yang memperbarui sesi.
        }
      },
    },
  });
}
