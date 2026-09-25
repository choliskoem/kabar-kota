import Link from "next/link";
import type { ArticleSummary } from "@/types/domain";
import { StoryMeta } from "./StoryMeta";
import { routeStyle } from "./route-style";
import styles from "./news.module.css";

/**
 * Berita terbaru digambar sebagai halte di satu jalur, urut dari yang paling baru.
 * Daftarnya bisa di-scroll di dalam panel supaya beranda tetap ringkas.
 */
export function LatestLine({ articles }: { articles: ArticleSummary[] }) {
  return (
    <section className={styles.panel} aria-labelledby="terkini-heading">
      <h2 id="terkini-heading" className={styles.panelHeading}>
        Terkini
      </h2>
      {/* tabIndex agar area scroll bisa digulir dengan keyboard; data-lenis-prevent agar
          smooth scroll halaman tidak "mencuri" guliran mouse di dalam panel ini. */}
      <div
        className={styles.lineScroller}
        tabIndex={0}
        role="region"
        aria-label="Daftar berita terkini, bisa digulir"
        data-lenis-prevent
      >
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
      </div>
    </section>
  );
}