import Link from "next/link";
import type { Category } from "@/types/domain";
import { routeStyle } from "./route-style";
import styles from "./news.module.css";

export function CategoryLabel({ category }: { category: Category }) {
  return (
    <Link
      href={`/kategori/${category.slug}`}
      className={styles.categoryLabel}
      style={routeStyle(category.color)}
    >
      {category.name}
    </Link>
  );
}
