import Link from "next/link";
import { changeStatusAction, deleteArticleAction } from "@/app/dashboard/actions";
import { formatRelative } from "@/lib/format";
import { publicImageUrl } from "@/lib/media-url";
import type { ArticleSummary } from "@/types/domain";
import { routeStyle } from "@/components/news/route-style";
import { PendingButton } from "./PendingButton";
import { StatusBadge } from "./StatusBadge";
import styles from "./dashboard.module.css";

interface ArticleListItemProps {
  article: ArticleSummary;
  isEditor: boolean;
  showAuthor: boolean;
}

export function ArticleListItem({ article, isEditor, showAuthor }: ArticleListItemProps) {
  const isPublished = article.status === "published";
  const canEdit = isEditor || !isPublished;
  const canDelete = isEditor || article.status === "draft";
  const editHref = `/dashboard/artikel/${article.id}`;

  return (
    <li className={styles.item} style={routeStyle(article.category.color)}>
      <div className={styles.itemThumb} aria-hidden="true">
        {article.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={publicImageUrl(article.cover.thumbPath)} alt="" loading="lazy" />
        ) : (
          <span>{article.category.name.charAt(0)}</span>
        )}
      </div>

      <div className={styles.itemBody}>
        <h2 className={styles.itemTitle}>
          {canEdit ? <Link href={editHref}>{article.title}</Link> : article.title}
        </h2>
        <p className={styles.itemMeta}>
          <span className={styles.itemCategory}>{article.category.name}</span>
          {showAuthor && <span>{article.authorName}</span>}
          <span>Diubah {formatRelative(article.updatedAt)}</span>
        </p>
      </div>

      <StatusBadge status={article.status} />

      <div className={styles.itemActions}>
        {canEdit && (
          <Link href={editHref} className={styles.textButton}>
            Ubah
          </Link>
        )}
        {isPublished && (
          <Link href={`/berita/${article.slug}`} target="_blank" rel="noopener" className={styles.textButton}>
            Lihat
          </Link>
        )}
        {isEditor && (
          <form action={changeStatusAction.bind(null, article.id, isPublished ? "draft" : "published")}>
            <PendingButton
              className={isPublished ? styles.textButton : styles.smallPrimaryButton}
              pendingText={isPublished ? "Menarik..." : "Menerbitkan..."}
              confirmMessage={isPublished ? "Tarik berita ini dari situs? Statusnya akan kembali menjadi draf." : undefined}
            >
              {isPublished ? "Tarik" : "Terbitkan"}
            </PendingButton>
          </form>
        )}
        {canDelete && (
          <form action={deleteArticleAction.bind(null, article.id)}>
            <PendingButton
              className={`${styles.textButton} ${styles.dangerText}`}
              pendingText="Menghapus..."
              confirmMessage={`Hapus "${article.title}"? Tindakan ini tidak bisa dibatalkan.`}
            >
              Hapus
            </PendingButton>
          </form>
        )}
      </div>
    </li>
  );
}