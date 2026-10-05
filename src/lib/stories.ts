import { resolveCoverImage } from "@/lib/cover-image";
import type { CategorySection } from "@/lib/news";
import type { Category } from "@/types/domain";

/** Data satu slide story: hanya yang dibutuhkan penampil, supaya kiriman ke browser kecil. */
export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
  imageSrc: string | null;
  thumbSrc: string | null;
  imageAlt: string;
}

export interface StoryGroup {
  category: Category;
  stories: Story[];
}

export function buildStoryGroups(sections: CategorySection[]): StoryGroup[] {
  return sections.map(({ category, articles }) => ({
    category,
    stories: articles.map((article) => {
      const large = resolveCoverImage(article, "large");
      const thumb = resolveCoverImage(article, "thumb");
      return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        publishedAt: article.publishedAt,
        imageSrc: large?.src ?? null,
        thumbSrc: thumb?.src ?? null,
        imageAlt: large?.alt ?? "",
      };
    }),
  }));
}