import { routeStyle } from "./route-style";
import styles from "./listing.module.css";

interface ListingHeroProps {
  title: string;
  description: string;
  color: string;
}

/** Judul besar di atas daftar berita (halaman kategori dan hashtag). */
export function ListingHero({ title, description, color }: ListingHeroProps) {
  return (
    <header className={styles.hero} style={routeStyle(color)}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
    </header>
  );
}
