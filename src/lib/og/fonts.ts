/** Font untuk pembuat gambar share (next/og hanya menerima TTF/OTF/WOFF, bukan WOFF2). */
export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700 | 800;
  style: "normal";
}

/**
 * Mengambil font dari Google Fonts, hanya untuk huruf yang dipakai (parameter text),
 * jadi ukurannya kecil. Tanpa header User-Agent browser, Google mengirim format TrueType.
 */
async function loadGoogleFont(family: string, axes: string, text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=${family}:${axes}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const source = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!source) throw new Error(`Font ${family} tidak tersedia dalam format TrueType.`);

  const response = await fetch(source[1]);
  if (!response.ok) throw new Error(`Gagal mengunduh font ${family}.`);
  return response.arrayBuffer();
}

/**
 * Bricolage Grotesque (judul, versi padat & tebal) dan Plus Jakarta Sans (teks kecil).
 * Bila Google Fonts tidak bisa dihubungi, kartu tetap dibuat dengan font bawaan.
 */
export async function loadShareCardFonts(text: string): Promise<OgFont[]> {
  try {
    const [display, body] = await Promise.all([
      loadGoogleFont("Bricolage+Grotesque", "opsz,wdth,wght@96,75,800", text),
      loadGoogleFont("Plus+Jakarta+Sans", "wght@700", text),
    ]);
    return [
      { name: "Display", data: display, weight: 800, style: "normal" },
      { name: "Body", data: body, weight: 700, style: "normal" },
    ];
  } catch (error) {
    console.warn("Kartu share memakai font bawaan:", (error as Error).message);
    return [];
  }
}