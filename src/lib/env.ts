function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Variabel lingkungan ${name} belum diisi. Salin .env.example ke .env.local.`);
  }
  return value;
}

// process.env.NEXT_PUBLIC_* harus ditulis lengkap agar Next.js bisa menyisipkannya ke bundle browser.
export const env = {
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseKey: required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
} as const;
