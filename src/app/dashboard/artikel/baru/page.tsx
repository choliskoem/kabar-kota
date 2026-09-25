import type { Metadata } from "next";
import { ArticleForm } from "@/components/dashboard/ArticleForm";
import { canPublish } from "@/lib/roles";
import { getCategories } from "@/services/articles";
import { requireStaff } from "@/services/auth";

export const metadata: Metadata = { title: "Tulis berita" };

export default async function NewArticlePage() {
  const [profile, categories] = await Promise.all([requireStaff(), getCategories()]);

  return (
    <>
      <h1>Tulis berita</h1>
      <ArticleForm categories={categories} canPublish={canPublish(profile.role)} />
    </>
  );
}
