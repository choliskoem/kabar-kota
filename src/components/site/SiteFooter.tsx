import Link from "next/link";
import { siteConfig } from "@/lib/site";
import type { Category } from "@/types/domain";
import styles from "./site.module.css";

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className={styles.footer}>
      <div className={`page ${styles.footerInner}`}>
        <p className={styles.footerName}>{siteConfig.name}</p>
        <p className={styles.footerTagline}>{siteConfig.description}</p>
        <nav aria-label="Kategori di footer" className={styles.footerNav}>
          {categories.map((category) => (
            <Link key={category.id} href={`/kategori/${category.slug}`}>
              {category.name}
            </Link>
          ))}
        </nav>
        <Link href="/masuk" className={styles.footerLogin}>
          Masuk redaksi
        </Link>
      </div>
    </footer>
  );
}
