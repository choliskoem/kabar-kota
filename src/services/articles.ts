// Query publik (tanpa sesi). Aman dipakai di halaman statis/ISR.
import { createPublicSupabase } from "@/lib/supabase/public";
import type {
  ArticleRow,
  ArticleSummaryRow,
  CategoryRow,
  TagRow,
  TrendingTagRow,
} from "@/types/database-rows";
import type { Article, ArticleSummary, Category, Tag, TrendingTag } from "@/types/domain";
import {
  ARTICLE_COLUMNS,
  ARTICLE_SUMMARY_COLUMNS,
  CATEGORY_COLUMNS,
  toArticle,
  toArticleSummary,
  toCategory,
  toTrendingTag,
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
  categoryId: number,
  limit: number,
): Promise<ArticleSummary[]> {
  const { data, error } = await createPublicSupabase()
    .from("articles")
    .select(ARTICLE_SUMMARY_COLUMNS)
    .eq("status", "published")
    .eq("category_id", categoryId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Gagal memuat berita kategori: ${error.message}`);
  return (data as unknown as ArticleSummaryRow[]).map(toArticleSummary);
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const { data, error } = await createPublicSupabase()
    .from("tags")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat tag: ${error.message}`);
  return (data as TagRow | null) ?? null;
}

export async function getArticlesByTag(tagId: number, limit: number): Promise<ArticleSummary[]> {
  const supabase = createPublicSupabase();
  const { data: links, error: linkError } = await supabase
    .from("article_tags")
    .select("article_id")
    .eq("tag_id", tagId);
  if (linkError) throw new Error(`Gagal memuat berita tag: ${linkError.message}`);

  const articleIds = (links as { article_id: string }[]).map(({ article_id }) => article_id);
  if (articleIds.length === 0) return [];

  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SUMMARY_COLUMNS)
    .eq("status", "published")
    .in("id", articleIds)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Gagal memuat berita tag: ${error.message}`);
  return (data as unknown as ArticleSummaryRow[]).map(toArticleSummary);
}

export async function getTrendingTags(limit: number): Promise<TrendingTag[]> {
  const { data, error } = await createPublicSupabase()
    .from("trending_tags")
    .select("id, name, slug, article_count")
    .order("article_count", { ascending: false })
    .order("name")
    .limit(limit);

  if (error) throw new Error(`Gagal memuat tag populer: ${error.message}`);
  return (data as TrendingTagRow[]).map(toTrendingTag);
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
