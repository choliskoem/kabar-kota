import Link from "next/link";
import { resolveCoverImage } from "@/lib/cover-image";
import type { ArticleSummary } from "@/types/domain";
import { LeadReveal } from "@/components/motion/LeadReveal";
import { CategoryLabel } from "./CategoryLabel";
import { NewsImage } from "./NewsImage";
import { StoryMeta } from "./StoryMeta";
import { routeStyle } from "./route-style";
import styles from "./news.module.css";

/** Berita utama sebagai poster: foto besar dengan blok warna kategori berisi judul. */
export function PosterStory({ article }: { article: ArticleSummary }) {
  const hasImage = resolveCoverImage(article, "large") !== null;

  return (
    <LeadReveal
      className={`${styles.poster} ${hasImage ? "" : styles.posterNoImage}`}
      style={routeStyle(article.category.color)}
    >
      {hasImage && (
        <div className={styles.posterMedia}>
          <NewsImage
            article={article}
            variant="large"
            sizes="(max-width: 900px) 100vw, 1240px"
            priority
            fill
          />
        </div>
      )}
      <div className={styles.posterSticker} data-reveal="sticker">
        <CategoryLabel category={article.category} />
      </div>
      <div className={styles.posterSlab} data-reveal="slab">
        <h1 className={styles.posterTitle}>
          <Link href={`/berita/${article.slug}`} className={styles.stretchedLink}>
            {article.title}
          </Link>
        </h1>
        <p className={styles.posterExcerpt}>{article.excerpt}</p>
        <StoryMeta article={article} />
      </div>
    </LeadReveal>
  );
}