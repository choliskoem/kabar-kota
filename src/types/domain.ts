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

export interface Article extends ArticleSummary {
  body: string;
  tags: Tag[];
}
