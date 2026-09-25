import type { Metadata } from "next";
import Link from "next/link";
import { ArticleListItem } from "@/components/dashboard/ArticleListItem";
import { FlashMessage } from "@/components/dashboard/FlashMessage";
import { SearchBox } from "@/components/dashboard/SearchBox";
import { StatusTabs } from "@/components/dashboard/StatusTabs";
import { flashMessages, isFlashKey } from "@/lib/flash";
import { isArticleStatus, statusLabel } from "@/lib/labels";
import { canPublish } from "@/lib/roles";
import { requireStaff } from "@/services/auth";
import { getDashboardArticles, getStatusCounts } from "@/services/editorial";
import type { ArticleStatus } from "@/types/domain";
import styles from "@/components/dashboard/dashboard.module.css";

export const metadata: Metadata = { title: "Dashboard redaksi" };

interface DashboardPageProps {
  searchParams: Promise<{ status?: string; q?: string; pesan?: string }>;
}

function emptyText(status: ArticleStatus | undefined, search: string | undefined): string {
  if (search) return `Tidak ada berita dengan judul yang mengandung "${search}".`;
  if (status) return `Belum ada berita berstatus "${statusLabel[status].toLowerCase()}".`;
  return "Belum ada berita. Mulai dengan menulis berita pertamamu.";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const status = isArticleStatus(params.status) ? params.status : undefined;
  const search = params.q?.trim() || undefined;

  const profile = await requireStaff();
  const isEditor = canPublish(profile.role);
  const [articles, counts] = await Promise.all([
    getDashboardArticles(profile, { status, search }),
    getStatusCounts(profile),
  ]);

  const firstName = profile.fullName.split(" ")[0] || "kamu";
  const reviewCount = counts.review;

  return (
    <>
      {isFlashKey(params.pesan) && <FlashMessage message={flashMessages[params.pesan]} />}

      <div className={styles.pageHead}>
        <div>
          <h1>Halo, {firstName}</h1>
          <p className={styles.lede}>
            {isEditor && reviewCount > 0
              ? `Ada ${reviewCount} berita menunggu kamu periksa.`
              : isEditor
                ? "Tidak ada berita yang menunggu diperiksa."
                : "Tulis, simpan, lalu kirim beritamu ke editor."}
          </p>
        </div>
        <Link href="/dashboard/artikel/baru" className={styles.primaryButton}>
          Tulis berita
        </Link>
      </div>

      <div className={styles.toolbar}>
        <StatusTabs
          counts={counts}
          active={status}
          search={search}
          highlight={isEditor ? "review" : undefined}
        />
        <SearchBox search={search} status={status} />
      </div>

      {articles.length === 0 ? (
        <div className={styles.empty}>
          <p>{emptyText(status, search)}</p>
          {(status || search) ? (
            <Link href="/dashboard" className={styles.textButton}>
              Lihat semua berita
            </Link>
          ) : (
            <Link href="/dashboard/artikel/baru" className={styles.primaryButton}>
              Tulis berita
            </Link>
          )}
        </div>
      ) : (
        <ul className={styles.list}>
          {articles.map((article) => (
            <ArticleListItem key={article.id} article={article} isEditor={isEditor} showAuthor={isEditor} />
          ))}
        </ul>
      )}
    </>
  );
}