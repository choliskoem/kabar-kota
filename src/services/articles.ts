// Query publik (tanpa sesi). Aman dipakai di halaman statis/ISR.
import { createPublicSupabase } from "@/lib/supabase/public";
import type { ArticleRow, ArticleSummaryRow, CategoryRow } from "@/types/database-rows";
import type { Article, ArticleSummary, Category } from "@/types/domain";
import {
  ARTICLE_COLUMNS,
  ARTICLE_SUMMARY_COLUMNS,
  CATEGORY_COLUMNS,
  toArticle,
  toArticleSummary,
  toCategory,
} from "@/services/mappers";

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await createPublicSupabase()
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .order("position");

  if (error) throw new Error(`Gagal memuat kategori: ${error.message}`);
  return (data as CategoryRow[]).map(toCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await createPublicSupabase()
    .from("categories")
    .select(CATEGORY_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat kategori: ${error.message}`);
  return data ? toCategory(data as CategoryRow) : null;
}

export async function getLatestArticles(limit: number): Promise<ArticleSummary[]> {
  const { data, error } = await createPublicSupabase()
    .from("articles")
    .select(ARTICLE_SUMMARY_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Gagal memuat berita terbaru: ${error.message}`);
  return (data as unknown as ArticleSummaryRow[]).map(toArticleSummary);
}

export async function getArticlesByCategory(
  categorySlug: string,
  limit: number,
): Promise<ArticleSummary[]> {
  const { data, error } = await createPublicSupabase()
    .from("articles")
    .select(ARTICLE_SUMMARY_COLUMNS)
    .eq("status", "published")
    .eq("category.slug", categorySlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Gagal memuat berita kategori: ${error.message}`);
  return (data as unknown as ArticleSummaryRow[]).map(toArticleSummary);
}

export async function getPublishedArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await createPublicSupabase()
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat berita: ${error.message}`);
  return data ? toArticle(data as unknown as ArticleRow) : null;
}

export async function getRecentSlugs(limit: number): Promise<string[]> {
  const { data, error } = await createPublicSupabase()
    .from("articles")
    .select("slug")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Gagal memuat daftar berita: ${error.message}`);
  return (data as { slug: string }[]).map(({ slug }) => slug);
}
