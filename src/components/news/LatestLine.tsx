import Link from "next/link";
import type { ArticleSummary } from "@/types/domain";
import { StoryMeta } from "./StoryMeta";
import { routeStyle } from "./route-style";
import styles from "./news.module.css";

/** Berita terbaru digambar sebagai halte di satu jalur, urut dari yang paling baru. */
export function LatestLine({ articles }: { articles: ArticleSummary[] }) {
  return (
    <section className={styles.panel} aria-labelledby="terkini-heading">
      <h2 id="terkini-heading" className={styles.panelHeading}>
        Terkini
      </h2>
      <ol className={styles.line}>
        {articles.map((article) => (
          <li key={article.id} className={styles.stop} style={routeStyle(article.category.color)}>
            <span className={styles.stopCategory}>{article.category.name}</span>
            <Link href={`/berita/${article.slug}`} className={styles.stopTitle}>
              {article.title}
            </Link>
            <StoryMeta article={article} />
          </li>
        ))}
      </ol>
    </section>
  );
}
