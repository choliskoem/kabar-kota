import { formatReadingTime, formatStamp } from "@/lib/format";
import type { ArticleSummary } from "@/types/domain";
import styles from "./news.module.css";

export function StoryMeta({ article }: { article: ArticleSummary }) {
  return (
    <p className={styles.meta}>
      {article.publishedAt && (
        <time dateTime={article.publishedAt}>{formatStamp(article.publishedAt)}</time>
      )}
      <span>{formatReadingTime(article.readingMinutes)}</span>
    </p>
  );
}
