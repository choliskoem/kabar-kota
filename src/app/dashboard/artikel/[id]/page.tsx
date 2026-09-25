import type { Metadata } from "next";
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

  if (article.status === "published" && !isEditor) {
    return (
      <>
        <h1>{article.title}</h1>
        <p className={styles.emptyNote}>
          Berita ini sudah terbit. Minta editor menariknya ke draf jika perlu diubah.
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Ubah berita</h1>
      <ArticleForm categories={categories} canPublish={isEditor} article={article} />
    </>
  );
}
