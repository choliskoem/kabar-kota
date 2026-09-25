import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingHero } from "@/components/news/ListingHero";
import { StoryItem } from "@/components/news/StoryItem";
import { getArticlesByCategory, getCategories, getCategoryBySlug } from "@/services/articles";
import newsStyles from "@/components/news/news.module.css";
import styles from "@/components/news/listing.module.css";

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
  const category = await getCategoryBySlug((await params).slug);
  if (!category) notFound();

  const articles = await getArticlesByCategory(category.id, 30);

  return (
    <div className={`page ${styles.listing}`}>
      <ListingHero
        title={category.name}
        description={`${articles.length} berita ${category.name.toLowerCase()} terbaru`}
        color={category.color}
      />
      {articles.length === 0 ? (
        <p className={styles.empty}>Belum ada berita {category.name.toLowerCase()} yang terbit.</p>
      ) : (
        <div className={newsStyles.grid}>
          {articles.map((article) => (
            <StoryItem key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
