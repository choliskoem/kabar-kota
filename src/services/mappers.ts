import type {
  ArticleRow,
  ArticleSummaryRow,
  ArticleWithHighlightsRow,
  CategoryRow,
  HighlightRow,
  MediaRow,
  PollRow,
  ProfileRow,
  TrendingTagRow,
} from "@/types/database-rows";
import type {
  Article,
  ArticleSummary,
  ArticleWithHighlights,
  Category,
  Media,
  Poll,
  Profile,
  TrendingTag,
} from "@/types/domain";

export const CATEGORY_COLUMNS = "id, name, slug, color";
export const MEDIA_COLUMNS =
  "id, storage_path, thumb_path, width, height, alt_text, caption, credit";

export const ARTICLE_SUMMARY_COLUMNS = `
  id, slug, title, excerpt, status, published_at, updated_at, reading_minutes,
  category:categories!inner(${CATEGORY_COLUMNS}),
  cover:media(${MEDIA_COLUMNS}),
  author:profiles(full_name)
`;

export const HIGHLIGHT_COLUMNS = "highlights:article_highlights(position, content)";

export const ARTICLE_WITH_HIGHLIGHTS_COLUMNS = `
  ${ARTICLE_SUMMARY_COLUMNS},
  ${HIGHLIGHT_COLUMNS}
`;

export const ARTICLE_COLUMNS = `
  ${ARTICLE_WITH_HIGHLIGHTS_COLUMNS},
  body,
  tags:article_tags(tag:tags(id, name, slug)),
  poll:polls(id, question, options:poll_options(id, position, label))
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
    readingMinutes: row.reading_minutes,
  };
}

export function toTrendingTag(row: TrendingTagRow): TrendingTag {
  return { id: row.id, name: row.name, slug: row.slug, articleCount: row.article_count };
}

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;

export function toHighlights(rows: HighlightRow[]): string[] {
  return [...rows].sort(byPosition).map(({ content }) => content);
}

export function toPoll(row: PollRow): Poll {
  return {
    id: row.id,
    question: row.question,
    options: [...row.options].sort(byPosition).map(({ id, label }) => ({ id, label })),
  };
}

export function toArticleWithHighlights(row: ArticleWithHighlightsRow): ArticleWithHighlights {
  return { ...toArticleSummary(row), highlights: toHighlights(row.highlights) };
}

export function toArticle(row: ArticleRow): Article {
  return {
    ...toArticleWithHighlights(row),
    body: row.body,
    tags: row.tags.map(({ tag }) => tag),
    poll: row.poll ? toPoll(row.poll) : null,
  };
}