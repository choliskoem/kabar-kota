import Link from "next/link";
import type { CategorySection as Section } from "@/lib/news";
import { StoryItem } from "./StoryItem";
import { routeStyle } from "./route-style";
import styles from "./news.module.css";

export function CategorySection({ section }: { section: Section }) {
  const { category, articles } = section;
  const headingId = `kategori-${category.slug}`;

  return (
    <section className={styles.section} style={routeStyle(category.color)} aria-labelledby={headingId}>
      <header className={styles.sectionHead}>
        <h2 id={headingId} className={styles.sectionTitle}>
          {category.name}
        </h2>
        <Link href={`/kategori/${category.slug}`} className={styles.sectionMore}>
          Semua berita {category.name.toLowerCase()}
        </Link>
      </header>
      <div className={styles.storyGrid}>
        {articles.map((article) => (
          <StoryItem key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
