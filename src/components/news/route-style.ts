import type { CSSProperties } from "react";
import { readableTextOn } from "@/lib/color";

/**
 * Warna kategori dikirim lewat CSS variable:
 * --route untuk latar/aksen, --on-route untuk teks yang tetap terbaca di atasnya.
 */
export function routeStyle(color: string): CSSProperties {
  return { "--route": color, "--on-route": readableTextOn(color) } as CSSProperties;
}
