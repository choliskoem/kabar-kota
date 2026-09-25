import type {
  ArticleRow,
  ArticleSummaryRow,
  CategoryRow,
  MediaRow,
  ProfileRow,
} from "@/types/database-rows";
import type { Article, ArticleSummary, Category, Media, Profile } from "@/types/domain";

export const CATEGORY_COLUMNS = "id, name, slug, color";
export const MEDIA_COLUMNS =
  "id, storage_path, thumb_path, width, height, alt_text, caption, credit";

export const ARTICLE_SUMMARY_COLUMNS = `
  id, slug, title, excerpt, status, published_at, updated_at,
  category:categories!inner(${CATEGORY_COLUMNS}),
  cover:media(${MEDIA_COLUMNS}),
  author:profiles(full_name)
`;

export const ARTICLE_COLUMNS = `
  ${ARTICLE_SUMMARY_COLUMNS},
  body,
  tags:article_tags(tag:tags(id, name, slug))
`;

export function toProfile(row: ProfileRow): Profile {
  return { id: row.id, fullName: row.full_name, role: row.role };
}

export function toCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, slug: row.slug, color: row.color };
}

export function toMedia(row: MediaRow): Media {
  return {
    id: row.id,
    storagePath: row.storage_path,
    thumbPath: row.thumb_path,
    width: row.width,
    height: row.height,
    altText: row.alt_text,
    caption: row.caption,
    credit: row.credit,
  };
}

export function toArticleSummary(row: ArticleSummaryRow): ArticleSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    status: row.status,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    category: toCategory(row.category),
    cover: row.cover ? toMedia(row.cover) : null,
    authorName: row.author?.full_name || "Redaksi",
  };
}

export function toArticle(row: ArticleRow): Article {
  return {
    ...toArticleSummary(row),
    body: row.body,
    tags: row.tags.map(({ tag }) => tag),
  };
}
