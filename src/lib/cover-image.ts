import { publicImageUrl } from "@/lib/media-url";
import { siteConfig } from "@/lib/site";
import type { ArticleSummary } from "@/types/domain";

export type CoverVariant = "large" | "thumb";

/** Gambar sampul yang siap ditampilkan, entah foto asli dari Storage atau foto dummy. */
export interface CoverImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string | null;
  credit: string | null;
}

const THUMB_WIDTH = 480;
const DUMMY_SOURCE = "https://picsum.photos/seed";
const DUMMY_SIZE: Record<CoverVariant, { width: number; height: number }> = {
  large: { width: 1600, height: 1056 },
  thumb: { width: 480, height: 317 },
};

/**
 * Foto asli selalu diutamakan. Bila berita belum punya foto dan foto dummy aktif,
 * dipakai foto Picsum yang dipilih dari slug, jadi setiap berita konsisten mendapat foto yang sama.
 */
export function resolveCoverImage(
  article: Pick<ArticleSummary, "slug" | "cover">,
  variant: CoverVariant,
): CoverImage | null {
  const { cover } = article;

  if (cover) {
    const isThumb = variant === "thumb";
    const width = isThumb ? Math.min(THUMB_WIDTH, cover.width) : cover.width;
    return {
      src: publicImageUrl(isThumb ? cover.thumbPath : cover.storagePath),
      width,
      height: Math.round((cover.height / cover.width) * width),
      alt: cover.altText,
      caption: cover.caption,
      credit: cover.credit,
    };
  }

  if (!siteConfig.useDummyImages) return null;

  const { width, height } = DUMMY_SIZE[variant];
  return {
    src: `${DUMMY_SOURCE}/${encodeURIComponent(article.slug)}/${width}/${height}`,
    width,
    height,
    // Foto dummy tidak menggambarkan isi berita, jadi diperlakukan sebagai hiasan.
    alt: "",
    caption: "Foto ilustrasi.",
    credit: "Picsum Photos",
  };
}