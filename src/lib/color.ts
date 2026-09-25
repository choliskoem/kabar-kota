export const INK = "#15182b";
export const WHITE = "#ffffff";

function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Memilih warna teks (tinta gelap atau putih) yang paling kontras di atas warna latar. */
export function readableTextOn(backgroundHex: string): string {
  const background = relativeLuminance(backgroundHex);
  const contrastWithWhite = 1.05 / (background + 0.05);
  const contrastWithInk = (background + 0.05) / (relativeLuminance(INK) + 0.05);
  return contrastWithInk >= contrastWithWhite ? INK : WHITE;
}
