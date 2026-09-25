import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Gambar sudah dikompres ke WebP (ukuran besar + thumbnail) sebelum diunggah,
    // jadi optimasi ulang oleh Vercel tidak diperlukan dan tidak memakan kuota paket Hobby.
    unoptimized: true,
  },
};

export default nextConfig;
