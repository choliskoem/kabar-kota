import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { statusLabel } from "@/lib/labels";
import { canPublish } from "@/lib/roles";
import { requireStaff } from "@/services/auth";
import { getDashboardArticles } from "@/services/editorial";
import type { ArticleSummary } from "@/types/domain";
import { changeStatusAction } from "./actions";
import styles from "@/components/dashboard/dashboard.module.css";

export const metadata: Metadata = { title: "Dashboard redaksi" };

export default async function DashboardPage() {
  const profile = await requireStaff();
  const articles = await getDashboardArticles(profile);
  const isEditor = canPublish(profile.role);

  return (
    <>
      <div className={styles.pageHead}>
        <h1>{isEditor ? "Semua berita" : "Berita saya"}</h1>
        <Link href="/dashboard/artikel/baru" className={styles.primaryButton}>
          Tulis berita
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className={styles.emptyNote}>Belum ada berita. Mulai dengan menulis berita pertamamu.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Judul</th>
                <th scope="col">Kategori</th>
                <th scope="col">Status</th>
                <th scope="col">Diperbarui</th>
                {isEditor && <th scope="col">Tindakan</th>}
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <ArticleRow key={article.id} article={article} isEditor={isEditor} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function ArticleRow({ article, isEditor }: { article: ArticleSummary; isEditor: boolean }) {
  const isPublished = article.status === "published";

  return (
    <tr>
      <td>
        <Link href={`/dashboard/artikel/${article.id}`}>{article.title}</Link>
      </td>
      <td>{article.category.name}</td>
      <td>
        <span className={styles.status} data-status={article.status}>
          {statusLabel[article.status]}
        </span>
      </td>
      <td>{formatDate(article.updatedAt)}</td>
      {isEditor && (
        <td>
          <form action={changeStatusAction.bind(null, article.id, isPublished ? "draft" : "published")}>
            <button type="submit" className={styles.linkButton}>
              {isPublished ? "Tarik ke draf" : "Terbitkan"}
            </button>
          </form>
        </td>
      )}
    </tr>
  );
}
