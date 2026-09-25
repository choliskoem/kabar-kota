import type { ArticleStatus } from "@/types/domain";
import styles from "./dashboard.module.css";

/** Formulir GET biasa: tetap berfungsi tanpa JavaScript dan hasilnya bisa dibagikan lewat URL. */
export function SearchBox({ search, status }: { search?: string; status?: ArticleStatus }) {
  return (
    <form role="search" action="/dashboard" className={styles.search}>
      {status && <input type="hidden" name="status" value={status} />}
      <label htmlFor="cari-berita" className={styles.visuallyHidden}>
        Cari judul berita
      </label>
      <input id="cari-berita" type="search" name="q" defaultValue={search} placeholder="Cari judul berita" />
      <button type="submit" className={styles.secondaryButton}>
        Cari
      </button>
    </form>
  );
}