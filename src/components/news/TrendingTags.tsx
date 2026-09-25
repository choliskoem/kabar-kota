import type { TrendingTag } from "@/types/domain";
import { HashtagSticker } from "./HashtagSticker";
import styles from "./news.module.css";

export function TrendingTags({ tags }: { tags: TrendingTag[] }) {
  if (tags.length === 0) return null;

  return (
    <section className={styles.panel} aria-labelledby="ramai-heading">
      <h2 id="ramai-heading" className={styles.panelHeading}>
        Lagi rame
      </h2>
      <ul className={styles.stickerCloud}>
        {tags.map((tag) => (
          <li key={tag.id}>
            <HashtagSticker tag={tag} count={tag.articleCount} />
          </li>
        ))}
      </ul>
    </section>
  );
}
