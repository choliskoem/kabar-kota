import { ImageResponse } from "next/og";
import { INK, readableTextOn } from "@/lib/color";
import { siteConfig } from "@/lib/site";
import { loadShareCardFonts } from "./fonts";

export const SHARE_CARD_SIZE = { width: 1200, height: 630 } as const;

const STABILO = "#FFE14D";
const WHITE = "#FFFFFF";
/** Latar gelap untuk kartu umum (beranda) supaya logo kuning tetap menonjol. */
export const BRAND_DARK = "#15182B";

interface ShareCardInput {
  /** Teks utama, mis. judul berita. */
  title: string;
  /** Stiker di pojok kanan atas, mis. nama kategori. */
  label: string;
  /** Warna latar (warna kategori). */
  color: string;
  /** Info kecil di bawah, mis. tanggal dan waktu baca. */
  details: string[];
  /** Warna semua kategori untuk garis jalur di logo. */
  routeColors: string[];
}

/** Judul panjang dibuat lebih kecil supaya tetap muat tanpa terpotong. */
function titleFontSize(title: string): number {
  if (title.length <= 45) return 96;
  if (title.length <= 75) return 80;
  if (title.length <= 110) return 66;
  return 56;
}

/**
 * Kartu bergaya stiker Kabar Kota untuk pratinjau tautan di WA, IG, X, dan lainnya.
 * Sengaja tanpa foto: pratinjau di aplikasi chat sering kecil, jadi judul besar lebih terbaca,
 * dan pembuat gambar next/og belum bisa membaca foto WebP.
 */
export async function renderShareCard({ title, label, color, details, routeColors }: ShareCardInput) {
  const textColor = readableTextOn(color);
  // Label kecil di bawah selalu berlawanan dengan warna teks agar terbaca di latar apa pun.
  const pill = textColor === INK ? { background: INK, color: WHITE } : { background: WHITE, color: INK };
  const fonts = await loadShareCardFonts(`${siteConfig.name}${title}${label}${details.join("")}`);
  // Bila font kustom gagal dimuat, properti fontFamily harus benar-benar tidak ada:
  // nilai undefined membuat next/og error, sedangkan tanpa properti ia memakai font bawaan.
  const hasCustomFonts = fonts.length > 0;
  const displayFont = hasCustomFonts ? { fontFamily: "Display" } : {};
  const bodyFont = hasCustomFonts ? { fontFamily: "Body" } : {};

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: color,
          color: textColor,
          ...bodyFont,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* Logo stiker */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: "12px 28px 16px",
              border: `6px solid ${INK}`,
              borderRadius: 24,
              background: STABILO,
              boxShadow: `8px 8px 0 ${INK}`,
              transform: "rotate(-3deg)",
            }}
          >
            <div style={{ ...displayFont, fontSize: 56, fontWeight: 800, color: INK, lineHeight: 1 }}>
              {siteConfig.name}
            </div>
            <div
              style={{
                display: "flex",
                height: 14,
                overflow: "hidden",
                border: `3px solid ${INK}`,
                borderRadius: 999,
              }}
            >
              {routeColors.map((routeColor, index) => (
                <div key={index} style={{ flex: 1, background: routeColor }} />
              ))}
            </div>
          </div>

          {/* Stiker kategori */}
          <div
            style={{
              display: "flex",
              padding: "10px 30px",
              border: `5px solid ${INK}`,
              borderRadius: 999,
              background: WHITE,
              color: INK,
              boxShadow: `6px 6px 0 ${INK}`,
              ...displayFont,
              fontSize: 36,
              fontWeight: 800,
              transform: "rotate(2deg)",
            }}
          >
            {label}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            maxWidth: 1060,
            ...displayFont,
            fontSize: titleFontSize(title),
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {details.map((detail) => (
            <div
              key={detail}
              style={{
                display: "flex",
                padding: "8px 20px",
                borderRadius: 999,
                ...pill,
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {detail}
            </div>
          ))}
        </div>
      </div>
    ),
    // Tanpa font kustom, opsi fonts tidak dikirim sama sekali: daftar kosong justru
    // mematikan font bawaan next/og dan membuat pembuatan gambar gagal.
    hasCustomFonts ? { ...SHARE_CARD_SIZE, fonts } : SHARE_CARD_SIZE,
  );
}