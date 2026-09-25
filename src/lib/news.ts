import type { ArticleSummary, Category } from "@/types/domain";

export interface CategorySection {
  category: Category;
  articles: ArticleSummary[];
}

/** Mengelompokkan berita per kategori sesuai urutan kategori; kategori kosong dilewati. */
export function groupByCategory(
  articles: ArticleSummary[],
  categories: Category[],
  perCategory: number,
): CategorySection[] {
  return categories
    .map((category) => ({
      category,
      articles: articles
        .filter((article) => article.category.id === category.id)
        .slice(0, perCategory),
    }))
    .filter((section) => section.articles.length > 0);
}
