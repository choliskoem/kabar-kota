import { resolveCoverImage } from "@/lib/cover-image";
import { formatRelative } from "@/lib/format";
import type { ArticleWithHighlights, Category } from "@/types/domain";

/** Data satu kartu swipe: hanya yang dibutuhkan tampilan, supaya kiriman ke browser kecil. */
export interface SwipeCard {
  id: string;
  slug: string;
  title: string;
  /** Poin TL;DR; bila kosong, kartu menampilkan ringkasan. */
  highlights: string[];
  excerpt: string;
  category: Category;
  /** Dihitung di server supaya teks waktu sama persis saat halaman dihidrasi di browser. */
  timeLabel: string | null;
  imageSrc: string | null;
  imageAlt: string;
}

export function buildSwipeCards(articles: ArticleWithHighlights[]): SwipeCard[] {
  return articles.map((article) => {
    const image = resolveCoverImage(article, "large");
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      highlights: article.highlights,
      excerpt: article.excerpt,
      category: article.category,
      timeLabel: article.publishedAt ? formatRelative(article.publishedAt) : null,
      imageSrc: image?.src ?? null,
      imageAlt: image?.alt ?? "",
    };
  });
}