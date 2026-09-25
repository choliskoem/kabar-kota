import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

const PROTECTED_PREFIX = "/dashboard";
const LOGIN_PATH = "/masuk";

/** Memperbarui token sesi di setiap request dan menjaga halaman dashboard. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

    const { pathname, search, searchParams } = request.nextUrl;

  if (!isLoggedIn && pathname.startsWith(PROTECTED_PREFIX)) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Jangan lempar balik ke dashboard kalau halaman masuk sedang menampilkan
  // pesan (mis. akun belum punya akses), supaya tidak terjadi redirect berulang.
  const hasLoginNotice = searchParams.has("error");
  if (isLoggedIn && pathname === LOGIN_PATH && !hasLoginNotice) {
    return NextResponse.redirect(new URL(PROTECTED_PREFIX, request.url));
  }

  return response;
}
}
