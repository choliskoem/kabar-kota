import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListenToArticle } from "@/components/article/ListenToArticle";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { ShareButton } from "@/components/article/ShareButton";
import { CategoryLabel } from "@/components/news/CategoryLabel";
import { HashtagSticker } from "@/components/news/HashtagSticker";
import { NewsImage } from "@/components/news/NewsImage";
import { StoryItem } from "@/components/news/StoryItem";
import { routeStyle } from "@/components/news/route-style";
import { formatDate, formatReadingTime, formatTime, splitParagraphs } from "@/lib/format";
import { resolveCoverImage } from "@/lib/cover-image";
import {
  getArticlesByCategory,
  getPublishedArticleBySlug,
  getRecentSlugs,
} from "@/services/articles";
import newsStyles from "@/components/news/news.module.css";
import styles from "@/components/article/article.module.css";

export const revalidate = 300;

const RELATED_COUNT = 3;

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
  const cover = resolveCoverImage(article, "large");

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt ?? undefined,
      images: cover ? [cover.src] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getPublishedArticleBySlug((await params).slug);
  if (!article) notFound();

  const related = (await getArticlesByCategory(article.category.id, RELATED_COUNT + 1))
    .filter(({ id }) => id !== article.id)
    .slice(0, RELATED_COUNT);
  const path = `/berita/${article.slug}`;
  const cover = resolveCoverImage(article, "large");
  const paragraphs = splitParagraphs(article.body);
  // Urutan ini harus sama dengan data-speech-index di bawah: judul, ringkasan, lalu paragraf.
  const speechSegments = [article.title, article.excerpt, ...paragraphs];

  return (
    <div style={routeStyle(article.category.color)}>
      <ReadingProgress />
      <article className={`page ${styles.article}`}>
        <header className={styles.header}>
          <CategoryLabel category={article.category} />
          <h1 className={styles.title} data-speech-index={0}>
            {article.title}
          </h1>
          <p className={styles.excerpt} data-speech-index={1}>
            {article.excerpt}
          </p>
          <div className={styles.byline}>
            <span className={styles.author}>{article.authorName}</span>
            {article.publishedAt && (
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}, {formatTime(article.publishedAt)}
              </time>
            )}
            <span>{formatReadingTime(article.readingMinutes)}</span>
            <ListenToArticle segments={speechSegments} />
            <ShareButton title={article.title} path={path} />
          </div>
        </header>

        {cover && (
          <figure className={styles.figure}>
            <div className={styles.figureMedia}>
              <NewsImage
                article={article}
                variant="large"
                sizes="(max-width: 1280px) 100vw, 1240px"
                priority
              />
            </div>
            {(cover.caption || cover.credit) && (
              <figcaption>
                {cover.caption && <span>{cover.caption}</span>}
                {cover.credit && <span>Foto: {cover.credit}</span>}
              </figcaption>
            )}
          </figure>
        )}

        <div className={styles.body}>
          {paragraphs.map((paragraph, index) => (
            <p key={index} data-speech-index={index + 2}>
              {paragraph}
            </p>
          ))}
        </div>

        {article.tags.length > 0 && (
          <ul className={styles.tags} aria-label="Tag">
            {article.tags.map((tag) => (
              <li key={tag.id}>
                <HashtagSticker tag={tag} />
              </li>
            ))}
          </ul>
        )}

        {related.length > 0 && (
          <section className={styles.related} aria-labelledby="baca-juga">
            <h2 id="baca-juga" className={styles.relatedTitle}>
              Baca juga
            </h2>
            <div className={newsStyles.grid}>
              {related.map((item) => (
                <StoryItem key={item.id} article={item} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}