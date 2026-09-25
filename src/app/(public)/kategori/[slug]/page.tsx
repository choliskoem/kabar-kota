import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryItem } from "@/components/news/StoryItem";
import { routeStyle } from "@/components/news/route-style";
import { getArticlesByCategory, getCategories, getCategoryBySlug } from "@/services/articles";
import styles from "./category.module.css";

export const revalidate = 120;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug);
  return category ? { title: `Berita ${category.name}` } : {};
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const articles = await getArticlesByCategory(slug, 30);

  return (
    <div className={`page ${styles.page}`} style={routeStyle(category.color)}>
      <h1 className={styles.title}>{category.name}</h1>
      {articles.length === 0 ? (
        <p>Belum ada berita {category.name.toLowerCase()} yang terbit.</p>
      ) : (
        <div className={styles.grid}>
          {articles.map((article) => (
            <StoryItem key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
