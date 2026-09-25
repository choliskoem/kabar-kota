import Link from "next/link";
import { siteConfig } from "@/lib/site";
import type { Category } from "@/types/domain";
import { routeStyle } from "@/components/news/route-style";
import styles from "./site.module.css";

/** Logo stiker: nama situs di atas garis jalur berwarna, satu segmen per kategori. */
export function Logo({ categories }: { categories: Category[] }) {
  return (
    <Link href="/" className={styles.logo} aria-label={`${siteConfig.name}, ke beranda`}>
      <span className={styles.logoText}>{siteConfig.name}</span>
      <span className={styles.logoRoute} aria-hidden="true">
        {categories.map((category) => (
          <span key={category.id} style={routeStyle(category.color)} />
        ))}
      </span>
    </Link>
  );
}