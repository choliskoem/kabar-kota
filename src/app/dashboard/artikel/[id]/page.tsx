import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/dashboard/ArticleForm";
import { canPublish } from "@/lib/roles";
import { getCategories } from "@/services/articles";
import { requireStaff } from "@/services/auth";
import { getEditableArticle } from "@/services/editorial";
import styles from "@/components/dashboard/dashboard.module.css";

export const metadata: Metadata = { title: "Ubah berita" };

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const [profile, categories, article] = await Promise.all([
    requireStaff(),
    getCategories(),
    getEditableArticle(id),
  ]);
  if (!article) notFound();

  const isEditor = canPublish(profile.role);
  const isLocked = article.status === "published" && !isEditor;

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <Link href="/dashboard" className={styles.backLink}>
            Kembali ke daftar berita
          </Link>
          <h1>{isLocked ? article.title : "Ubah berita"}</h1>
        </div>
        {article.status === "published" && (
          <Link href={`/berita/${article.slug}`} target="_blank" rel="noopener" className={styles.secondaryButton}>
            Lihat di situs
          </Link>
        )}
      </div>

      {isLocked ? (
        <div className={styles.empty}>
          <p>Berita ini sudah terbit. Minta editor menariknya ke draf jika perlu diubah.</p>
        </div>
      ) : (
        <ArticleForm categories={categories} canPublish={isEditor} article={article} />
      )}
    </>
  );
}