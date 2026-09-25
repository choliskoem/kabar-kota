import Link from "next/link";
import { siteConfig } from "@/lib/site";
import styles from "./site.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`page ${styles.footerInner}`}>
        <p className={styles.footerName}>{siteConfig.name}</p>
        <p>{siteConfig.description}</p>
        <Link href="/masuk">Masuk redaksi</Link>
      </div>
    </footer>
  );
}
