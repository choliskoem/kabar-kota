// Operasi redaksi (butuh sesi). Hak akses akhir tetap dijaga oleh RLS di database.
import { canPublish } from "@/lib/roles";
import { createArticleSlug, slugify } from "@/lib/slug";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  ARTICLE_COLUMNS,
  ARTICLE_SUMMARY_COLUMNS,
  toArticle,
  toArticleSummary,
} from "@/services/mappers";
import type { ArticleRow, ArticleSummaryRow } from "@/types/database-rows";
import type { Article, ArticleStatus, ArticleSummary, Profile } from "@/types/domain";
import type { ArticleInput } from "@/validation/article";

type ServerSupabase = Awaited<ReturnType<typeof createServerSupabase>>;

export interface DashboardFilter {
  status?: ArticleStatus;
  search?: string;
}

export type StatusCounts = Record<ArticleStatus, number>;

const ARTICLE_STATUSES: ArticleStatus[] = ["draft", "review", "published"];

/** Editor melihat semua berita; penulis hanya berita miliknya. */
export async function getDashboardArticles(
  profile: Profile,
  filter: DashboardFilter = {},
): Promise<ArticleSummary[]> {
  const supabase = await createServerSupabase();
  let query = supabase
    .from("articles")
    .select(ARTICLE_SUMMARY_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (!canPublish(profile.role)) query = query.eq("author_id", profile.id);
  if (filter.status) query = query.eq("status", filter.status);
  if (filter.search) query = query.ilike("title", `%${escapeLikePattern(filter.search)}%`);

  const { data, error } = await query;
  if (error) throw new Error(`Gagal memuat daftar berita: ${error.message}`);
  return (data as unknown as ArticleSummaryRow[]).map(toArticleSummary);
}

export async function getStatusCounts(profile: Profile): Promise<StatusCounts> {
  const supabase = await createServerSupabase();

  const entries = await Promise.all(
    ARTICLE_STATUSES.map(async (status) => {
      let query = supabase
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      if (!canPublish(profile.role)) query = query.eq("author_id", profile.id);

      const { count, error } = await query;
      if (error) throw new Error(`Gagal menghitung berita: ${error.message}`);
      return [status, count ?? 0] as const;
    }),
  );

  return Object.fromEntries(entries) as StatusCounts;
}

export async function getEditableArticle(id: string): Promise<Article | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Gagal memuat artikel: ${error.message}`);
  return data ? toArticle(data as unknown as ArticleRow) : null;
}

export async function saveArticle(input: ArticleInput, author: Profile): Promise<void> {
  const supabase = await createServerSupabase();
  const fields = {
    title: input.title,
    excerpt: input.excerpt,
    body: input.body,
    category_id: input.categoryId,
    cover_media_id: input.coverMediaId ?? null,
    status: input.status,
  };

  const articleId = input.id
    ? await updateArticle(supabase, input.id, fields)
    : await insertArticle(supabase, { ...fields, slug: createArticleSlug(input.title), author_id: author.id });

  const tagIds = await resolveTagIds(supabase, input.tags);
  await replaceArticleTags(supabase, articleId, tagIds);
}

export async function changeArticleStatus(id: string, status: ArticleStatus): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("articles").update({ status }).eq("id", id);
  if (error) throw new Error(`Gagal mengubah status: ${error.message}`);
}

export async function deleteArticle(id: string): Promise<void> {
  const supabase = await createServerSupabase();
  const { error, count } = await supabase.from("articles").delete({ count: "exact" }).eq("id", id);

  if (error) throw new Error(`Gagal menghapus berita: ${error.message}`);
  if (count === 0) {
    throw new Error("Berita tidak bisa dihapus. Penulis hanya bisa menghapus draf miliknya.");
  }
}

/** % dan _ punya arti khusus di pola LIKE, jadi di-escape agar dicari apa adanya. */
function escapeLikePattern(text: string): string {
  return text.replace(/[\\%_]/g, (character) => `\\${character}`);
}

async function insertArticle(supabase: ServerSupabase, row: Record<string, unknown>): Promise<string> {
  const { data, error } = await supabase.from("articles").insert(row).select("id").single();
  if (error) throw new Error(`Gagal menyimpan artikel: ${error.message}`);
  return (data as { id: string }).id;
}

async function updateArticle(
  supabase: ServerSupabase,
  id: string,
  row: Record<string, unknown>,
): Promise<string> {
  const { data, error } = await supabase
    .from("articles")
    .update(row)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(`Gagal memperbarui artikel: ${error.message}`);
  if (!data) throw new Error("Artikel tidak ditemukan atau kamu tidak punya akses untuk mengubahnya.");
  return (data as { id: string }).id;
}

/** Membuat tag yang belum ada, lalu mengembalikan id semua tag yang diminta. */
async function resolveTagIds(supabase: ServerSupabase, names: string[]): Promise<number[]> {
  if (names.length === 0) return [];

  const rows = names.map((name) => ({ name, slug: slugify(name) }));
  const { error: upsertError } = await supabase
    .from("tags")
    .upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
  if (upsertError) throw new Error(`Gagal menyimpan tag: ${upsertError.message}`);

  const { data, error } = await supabase
    .from("tags")
    .select("id")
    .in("slug", rows.map((row) => row.slug));
  if (error) throw new Error(`Gagal memuat tag: ${error.message}`);

  return (data as { id: number }[]).map(({ id }) => id);
}

async function replaceArticleTags(
  supabase: ServerSupabase,
  articleId: string,
  tagIds: number[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("article_tags")
    .delete()
    .eq("article_id", articleId);
  if (deleteError) throw new Error(`Gagal memperbarui tag artikel: ${deleteError.message}`);

  if (tagIds.length === 0) return;

  const { error } = await supabase
    .from("article_tags")
    .insert(tagIds.map((tagId) => ({ article_id: articleId, tag_id: tagId })));
  if (error) throw new Error(`Gagal memperbarui tag artikel: ${error.message}`);
}