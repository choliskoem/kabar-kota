// Bentuk baris mentah dari Supabase (snake_case). Hanya dipakai di lapisan services.
// Tip: bisa diganti hasil `npx supabase gen types typescript` agar sepenuhnya otomatis.
import type { ArticleStatus, UserRole } from "@/types/domain";

export interface ProfileRow {
  id: string;
  full_name: string;
  role: UserRole;
}

export interface CategoryRow {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export interface TagRow {
  id: number;
  name: string;
  slug: string;
}

export interface TrendingTagRow extends TagRow {
  article_count: number;
}

export interface MediaRow {
  id: string;
  storage_path: string;
  thumb_path: string;
  width: number;
  height: number;
  alt_text: string;
  caption: string | null;
  credit: string | null;
}

export interface ArticleSummaryRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: ArticleStatus;
  published_at: string | null;
  updated_at: string;
  category: CategoryRow;
  cover: MediaRow | null;
  author: Pick<ProfileRow, "full_name"> | null;
  reading_minutes: number;
}

export interface ArticleRow extends ArticleSummaryRow {
  body: string;
  tags: { tag: TagRow }[];
}
