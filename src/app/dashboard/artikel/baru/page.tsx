import type { Metadata } from "next";
import Link from "next/link";
import { ArticleForm } from "@/components/dashboard/ArticleForm";
import { canPublish } from "@/lib/roles";
import { getCategories } from "@/services/articles";
import { requireStaff } from "@/services/auth";
import styles from "@/components/dashboard/dashboard.module.css";

export const metadata: Metadata = { title: "Tulis berita" };

export default async function NewArticlePage() {
  const [profile, categories] = await Promise.all([requireStaff(), getCategories()]);

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <Link href="/dashboard" className={styles.backLink}>
            Kembali ke daftar berita
          </Link>
          <h1>Tulis berita</h1>
        </div>
      </div>
      <ArticleForm categories={categories} canPublish={canPublish(profile.role)} />
    </>
  );
}