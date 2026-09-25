import Link from "next/link";
import { siteConfig } from "@/lib/site";
import type { Category } from "@/types/domain";
import { routeStyle } from "@/components/news/route-style";
import styles from "./site.module.css";

export function SiteHeader({ categories }: { categories: Category[] }) {
  return (
    <header className={styles.header}>
      <div className={`page ${styles.headerInner}`}>
        <Link href="/" className={styles.wordmark}>
          {siteConfig.name}
        </Link>
        <nav aria-label="Kategori berita" className={styles.nav}>
          <ul>
            {categories.map((category) => (
              <li key={category.id} style={routeStyle(category.color)}>
                <Link href={`/kategori/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Garis jalur: satu segmen warna untuk setiap kategori */}
      <div className={styles.routeStrip} aria-hidden="true">
        {categories.map((category) => (
          <span key={category.id} style={routeStyle(category.color)} />
        ))}
      </div>
    </header>
  );
}
