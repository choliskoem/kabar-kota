import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryLabel } from "@/components/news/CategoryLabel";
import { NewsImage } from "@/components/news/NewsImage";
import { routeStyle } from "@/components/news/route-style";
import { formatDate, formatTime, splitParagraphs } from "@/lib/format";
import { publicImageUrl } from "@/lib/media-url";
import { getPublishedArticleBySlug, getRecentSlugs } from "@/services/articles";
import styles from "./article.module.css";

export const revalidate = 300;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

/** Berita terbaru dirender saat build; sisanya dirender saat pertama kali dibuka. */
export async function generateStaticParams() {
  const slugs = await getRecentSlugs(30);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getPublishedArticleBySlug((await params).slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt ?? undefined,
      images: article.cover ? [publicImageUrl(article.cover.storagePath)] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getPublishedArticleBySlug((await params).slug);
  if (!article) notFound();

  return (
    <article className={`page ${styles.article}`} style={routeStyle(article.category.color)}>
      <div className={styles.route} aria-hidden="true" />

      <header className={styles.header}>
        <div>
          <CategoryLabel category={article.category} />
        </div>
        <h1 className={styles.title}>{article.title}</h1>
        <p className={styles.excerpt}>{article.excerpt}</p>
        <p className={styles.byline}>
          Oleh {article.authorName}
          {article.publishedAt && (
            <>
              {", "}
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}, {formatTime(article.publishedAt)}
              </time>
            </>
          )}
        </p>
      </header>

      {article.cover && (
        <figure className={styles.figure}>
          <NewsImage
            media={article.cover}
            category={article.category}
            variant="large"
            sizes="(max-width: 1000px) 100vw, 960px"
            priority
          />
          {(article.cover.caption || article.cover.credit) && (
            <figcaption>
              {article.cover.caption && <span>{article.cover.caption}</span>}
              {article.cover.credit && <span>Foto: {article.cover.credit}</span>}
            </figcaption>
          )}
        </figure>
      )}

      <div className={styles.body}>
        {splitParagraphs(article.body).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {article.tags.length > 0 && (
        <ul className={styles.tags} aria-label="Tag">
          {article.tags.map((tag) => (
            <li key={tag.id}>{tag.name}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
