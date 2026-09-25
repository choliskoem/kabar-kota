import Link from "next/link";
import { statusLabel } from "@/lib/labels";
import type { StatusCounts } from "@/services/editorial";
import type { ArticleStatus } from "@/types/domain";
import styles from "./dashboard.module.css";

interface StatusTabsProps {
  counts: StatusCounts;
  active?: ArticleStatus;
  search?: string;
  /** Status yang perlu perhatian (mis. "review" untuk editor) diberi penanda. */
  highlight?: ArticleStatus;
}

const TAB_ORDER: ArticleStatus[] = ["draft", "review", "published"];

export function StatusTabs({ counts, active, search, highlight }: StatusTabsProps) {
  const total = TAB_ORDER.reduce((sum, status) => sum + counts[status], 0);

  const hrefFor = (status?: ArticleStatus) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("q", search);
    const query = params.toString();
    return query ? `/dashboard?${query}` : "/dashboard";
  };

  return (
    <nav className={styles.tabs} aria-label="Saring menurut status">
      <Link href={hrefFor()} aria-current={!active ? "page" : undefined}>
        Semua <span className={styles.tabCount}>{total}</span>
      </Link>
      {TAB_ORDER.map((status) => (
        <Link
          key={status}
          href={hrefFor(status)}
          aria-current={active === status ? "page" : undefined}
          data-attention={highlight === status && counts[status] > 0 ? "" : undefined}
        >
          {statusLabel[status]} <span className={styles.tabCount}>{counts[status]}</span>
        </Link>
      ))}
    </nav>
  );
}