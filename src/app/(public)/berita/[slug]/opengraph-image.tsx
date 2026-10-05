import { formatDate, formatReadingTime } from "@/lib/format";
import { BRAND_DARK, SHARE_CARD_SIZE, renderShareCard } from "@/lib/og/share-card";
import { siteConfig } from "@/lib/site";
import { getCategories, getPublishedArticleBySlug } from "@/services/articles";

export const alt = `Kartu berita ${siteConfig.name}`;
export const size = SHARE_CARD_SIZE;
export const contentType = "image/png";

export default async function ArticleShareImage({ params }: { params: Promise<{ slug: string }> }) {
  const [article, categories] = await Promise.all([
    getPublishedArticleBySlug((await params).slug),
    getCategories(),
  ]);
  const routeColors = categories.map(({ color }) => color);

  if (!article) {
    return renderShareCard({
      title: siteConfig.description,
      label: "Berita",
      color: BRAND_DARK,
      details: [],
      routeColors,
    });
  }

  return renderShareCard({
    title: article.title,
    label: article.category.name,
    color: article.category.color,
    details: [
      ...(article.publishedAt ? [formatDate(article.publishedAt)] : []),
      formatReadingTime(article.readingMinutes),
    ],
    routeColors,
  });
}