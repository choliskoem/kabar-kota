import { cookies } from "next/headers";

const VISITOR_COOKIE = "kk_visitor";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Id anonim pengunjung (bukan data pribadi), disimpan di cookie httpOnly.
 * Dipakai agar satu pengunjung hanya punya satu reaksi per berita.
 * Hanya boleh dipanggil dari Server Action atau Route Handler.
 */
export async function getOrCreateVisitorId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing && UUID_PATTERN.test(existing)) return existing;

  const visitorId = crypto.randomUUID();
  store.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });
  return visitorId;
}