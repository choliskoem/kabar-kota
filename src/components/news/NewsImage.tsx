import Image from "next/image";
import { publicImageUrl } from "@/lib/media-url";
import type { Category, Media } from "@/types/domain";
import { routeStyle } from "./route-style";
import styles from "./news.module.css";

const THUMB_WIDTH = 480;

interface NewsImageProps {
  media: Media | null;
  category: Category;
  variant: "large" | "thumb";
  sizes: string;
  priority?: boolean;
  /** Mengisi penuh wadah induk (wadah harus position: relative). */
  fill?: boolean;
}

export function NewsImage({ media, category, variant, sizes, priority = false, fill = false }: NewsImageProps) {
  if (!media) {
    // Berita tanpa foto tetap punya bidang visual: blok warna kategorinya.
    return (
      <div className={styles.imageFallback} style={routeStyle(category.color)} aria-hidden="true">
        <span>{category.name}</span>
      </div>
    );
  }

  const isThumb = variant === "thumb";
  const src = publicImageUrl(isThumb ? media.thumbPath : media.storagePath);

  if (fill) {
    return (
      <Image className={styles.image} src={src} alt={media.altText} fill sizes={sizes} priority={priority} />
    );
  }

  const width = isThumb ? Math.min(THUMB_WIDTH, media.width) : media.width;
  const height = Math.round((media.height / media.width) * width);

  return (
    <Image
      className={styles.image}
      src={src}
      alt={media.altText}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
    />
  );
}
