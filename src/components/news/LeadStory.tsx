import Link from "next/link";
import { formatStamp } from "@/lib/format";
import type { ArticleSummary } from "@/types/domain";
import { LeadReveal } from "@/components/motion/LeadReveal";
import { CategoryLabel } from "./CategoryLabel";
import { NewsImage } from "./NewsImage";
import { routeStyle } from "./route-style";
import styles from "./news.module.css";

export function LeadStory({ article }: { article: ArticleSummary }) {
  return (
    <LeadReveal className={styles.lead} style={routeStyle(article.category.color)}>
      <div className={styles.leadRoute} data-reveal="route" aria-hidden="true" />
      <div className={styles.leadText}>
        <div data-reveal="text">
          <CategoryLabel category={article.category} />
        </div>
        <h1 className={styles.leadTitle} data-reveal="text">
          <Link href={`/berita/${article.slug}`}>{article.title}</Link>
        </h1>
        <p className={styles.leadExcerpt} data-reveal="text">
          {article.excerpt}
        </p>
        <p className={styles.meta} data-reveal="text">
          <span>{article.authorName}</span>
          {article.publishedAt && (
            <time dateTime={article.publishedAt}>{formatStamp(article.publishedAt)}</time>
          )}
        </p>
      </div>
      <div className={styles.leadMedia}>
        <NewsImage
          media={article.cover}
          category={article.category}
          variant="large"
          sizes="(max-width: 900px) 100vw, 45vw"
          priority
        />
      </div>
    </LeadReveal>
  );
}
