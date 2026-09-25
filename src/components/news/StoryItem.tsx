import Link from "next/link";
import type { ArticleSummary } from "@/types/domain";
import { NewsImage } from "./NewsImage";
import { StoryMeta } from "./StoryMeta";
import styles from "./news.module.css";

export function StoryItem({ article }: { article: ArticleSummary }) {
  return (
    <article className={styles.story}>
      <div className={styles.storyMedia}>
        <NewsImage
          media={article.cover}
          category={article.category}
          variant="thumb"
          sizes="(max-width: 700px) 80vw, 33vw"
          fill
        />
      </div>
      <h3 className={styles.storyTitle}>
        <Link href={`/berita/${article.slug}`} className={styles.stretchedLink}>
          {article.title}
        </Link>
      </h3>
      <StoryMeta article={article} />
    </article>
  );
}
