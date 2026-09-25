import Link from "next/link";
import { formatStamp } from "@/lib/format";
import type { ArticleSummary } from "@/types/domain";
import { routeStyle } from "./route-style";
import styles from "./news.module.css";

/** Berita terbaru digambar sebagai halte di satu jalur, urut dari yang paling baru. */
export function LatestLine({ articles }: { articles: ArticleSummary[] }) {
  return (
    <section className={styles.latest} aria-labelledby="terkini-heading">
      <h2 id="terkini-heading" className={styles.latestHeading}>
        Terkini
      </h2>
      <ol className={styles.line}>
        {articles.map((article) => (
          <li key={article.id} className={styles.stop} style={routeStyle(article.category.color)}>
            {article.publishedAt && (
              <time className={styles.stopTime} dateTime={article.publishedAt}>
                {formatStamp(article.publishedAt)}
              </time>
            )}
            <Link href={`/berita/${article.slug}`} className={styles.stopTitle}>
              {article.title}
            </Link>
            <span className={styles.stopCategory}>{article.category.name}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
