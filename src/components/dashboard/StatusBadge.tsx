import { statusLabel } from "@/lib/labels";
import type { ArticleStatus } from "@/types/domain";
import styles from "./dashboard.module.css";

export function StatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <span className={styles.status} data-status={status}>
      {statusLabel[status]}
    </span>
  );
}