export type UserRole = "reader" | "writer" | "editor" | "admin";
export type ArticleStatus = "draft" | "review" | "published";

export interface Profile {
  id: string;
  fullName: string;
  role: UserRole;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface TrendingTag extends Tag {
  articleCount: number;
}

export interface Media {
  id: string;
  storagePath: string;
  thumbPath: string;
  width: number;
  height: number;
  altText: string;
  caption: string | null;
  credit: string | null;
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: ArticleStatus;
  publishedAt: string | null;
  updatedAt: string;
  category: Category;
  cover: Media | null;
  authorName: string;
  readingMinutes: number;
}

export interface PollOption {
  id: number;
  label: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

/** Jumlah suara per id pilihan polling. */
export type PollVotes = Record<number, number>;

/** Ringkasan berita ditambah poin TL;DR, dipakai di mode swipe. */
export interface ArticleWithHighlights extends ArticleSummary {
  highlights: string[];
}

export interface Article extends ArticleWithHighlights {
  body: string;
  tags: Tag[];
  poll: Poll | null;
}

export type ReactionKind = "fire" | "wow" | "haha" | "sad" | "angry";

export type ReactionCounts = Record<ReactionKind, number>;