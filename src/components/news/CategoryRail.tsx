import Link from "next/link";
import type { CategorySection } from "@/lib/news";
import { StoryItem } from "./StoryItem";
import { routeStyle } from "./route-style";
import styles from "./news.module.css";

/** Satu baris berita per kategori: bisa di-swipe di HP, jadi grid di layar lebar. */
export function CategoryRail({ section }: { section: CategorySection }) {
  const { category, articles } = section;
  const headingId = `kategori-${category.slug}`;

  return (
    <section className={styles.rail} style={routeStyle(category.color)} aria-labelledby={headingId}>
      <header className={styles.railHead}>
        <h2 id={headingId} className={styles.railTitle}>
          {category.name}
        </h2>
        <Link href={`/kategori/${category.slug}`} className={styles.railMore}>
          Lihat semua
        </Link>
      </header>
      <div className={styles.railTrack}>
        {articles.map((article) => (
          <StoryItem key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
