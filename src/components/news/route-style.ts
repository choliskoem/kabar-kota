import type { CSSProperties } from "react";

/** Warna jalur kategori dikirim lewat CSS variable --route. */
export function routeStyle(color: string): CSSProperties {
  return { "--route": color } as CSSProperties;
}
