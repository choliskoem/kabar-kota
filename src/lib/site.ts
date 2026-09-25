export const siteConfig = {
  name: "Kabar Kota",
  description: "Berita kota yang singkat, jelas, dan dekat dengan keseharianmu.",
  locale: "id-ID",
  timeZone: "Asia/Jakarta",
  /**
   * Berita tanpa foto sampul menampilkan foto dummy dari Picsum Photos.
   * Ubah ke false bila semua berita sudah punya foto asli.
   */
  useDummyImages: true,
} as const;