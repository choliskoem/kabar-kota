import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { ArticleSummary } from "@/types/domain";
import { NewsImage } from "./NewsImage";
import styles from "./news.module.css";

export function StoryItem({ article }: { article: ArticleSummary }) {
  return (
    <article className={styles.story}>
      <div className={styles.storyMedia}>
        <NewsImage
          media={article.cover}
          category={article.category}
          variant="thumb"
          sizes="(max-width: 700px) 100vw, 33vw"
        />
      </div>
      <h3 className={styles.storyTitle}>
        <Link href={`/berita/${article.slug}`} className={styles.stretchedLink}>
          {article.title}
        </Link>
      </h3>
      {article.publishedAt && (
        <time className={styles.meta} dateTime={article.publishedAt}>
          {formatDate(article.publishedAt)}
        </time>
      )}
    </article>
  );
}
