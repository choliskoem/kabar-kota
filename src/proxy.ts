import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Hanya berjalan di halaman yang butuh sesi, jadi halaman berita tetap statis dan cepat.
export const config = {
  matcher: ["/dashboard/:path*", "/masuk"],
};
