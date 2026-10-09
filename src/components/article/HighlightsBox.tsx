import styles from "./article.module.css";

/** Kotak "Intinya": poin TL;DR yang ditulis redaksi, tampil di atas berita. */
export function HighlightsBox({ highlights }: { highlights: string[] }) {
  if (highlights.length === 0) return null;

  return (
    <aside className={styles.highlights} aria-labelledby="intinya-heading">
      <h2 id="intinya-heading" className={styles.highlightsTitle}>
        Intinya
      </h2>
      <ol className={styles.highlightList}>
        {highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ol>
    </aside>
  );
}