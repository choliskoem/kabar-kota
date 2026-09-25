import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingHero } from "@/components/news/ListingHero";
import { StoryItem } from "@/components/news/StoryItem";
import { toHashtag } from "@/lib/format";
import { getArticlesByTag, getTagBySlug } from "@/services/articles";
import newsStyles from "@/components/news/news.module.css";
import styles from "@/components/news/listing.module.css";

export const revalidate = 120;

/** Warna halaman hashtag: kuning stabilo, sama dengan stiker hashtag. */
const HASHTAG_COLOR = "#FFE14D";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tag = await getTagBySlug((await params).slug);
  return tag ? { title: toHashtag(tag.name) } : {};
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = await getTagBySlug((await params).slug);
  if (!tag) notFound();

  const articles = await getArticlesByTag(tag.id, 30);

  return (
    <div className={`page ${styles.listing}`}>
      <ListingHero
        title={toHashtag(tag.name)}
        description={`${articles.length} berita dengan tag ini`}
        color={HASHTAG_COLOR}
      />
      {articles.length === 0 ? (
        <p className={styles.empty}>Belum ada berita terbit dengan tag ini.</p>
      ) : (
        <div className={newsStyles.grid}>
          {articles.map((article) => (
            <StoryItem key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
