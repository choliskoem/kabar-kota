import Image from "next/image";
import { resolveCoverImage, type CoverVariant } from "@/lib/cover-image";
import type { ArticleSummary } from "@/types/domain";
import { routeStyle } from "./route-style";
import styles from "./news.module.css";

interface NewsImageProps {
  article: ArticleSummary;
  variant: CoverVariant;
  sizes: string;
  priority?: boolean;
  /** Mengisi penuh wadah induk (wadah harus position: relative). */
  fill?: boolean;
}

export function NewsImage({ article, variant, sizes, priority = false, fill = false }: NewsImageProps) {
  const image = resolveCoverImage(article, variant);

  if (!image) {
    // Tanpa foto (dan foto dummy dimatikan): tampilkan blok warna kategori.
    return (
      <div className={styles.imageFallback} style={routeStyle(article.category.color)} aria-hidden="true">
        <span>{article.category.name}</span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image className={styles.image} src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} />
    );
  }

  return (
    <Image
      className={styles.image}
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
    />
  );
}