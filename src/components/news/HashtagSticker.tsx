import Link from "next/link";
import { toHashtag } from "@/lib/format";
import type { Tag } from "@/types/domain";
import styles from "./news.module.css";

export function HashtagSticker({ tag, count }: { tag: Tag; count?: number }) {
  return (
    <Link href={`/tag/${tag.slug}`} className={`${styles.sticker} ${styles.hashtag}`}>
      {toHashtag(tag.name)}
      {count !== undefined && (
        <span className={styles.hashtagCount} aria-label={`${count} berita`}>
          {count}
        </span>
      )}
    </Link>
  );
}
