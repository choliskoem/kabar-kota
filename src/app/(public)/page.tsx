import Link from "next/link";
import { CategorySection } from "@/components/news/CategorySection";
import { LatestLine } from "@/components/news/LatestLine";
import { LeadStory } from "@/components/news/LeadStory";
import { groupByCategory } from "@/lib/news";
import { getCategories, getLatestArticles } from "@/services/articles";
import styles from "./home.module.css";

export const revalidate = 60;

const LATEST_COUNT = 6;
const STORIES_PER_CATEGORY = 3;

export default async function HomePage() {
  const [articles, categories] = await Promise.all([getLatestArticles(40), getCategories()]);

  if (articles.length === 0) {
    return (
      <div className={`page ${styles.empty}`}>
        <h1>Belum ada berita yang terbit</h1>
        <p>Tulis berita pertama dari dashboard redaksi, lalu terbitkan agar muncul di sini.</p>
        <Link href="/dashboard/artikel/baru">Tulis berita</Link>
      </div>
    );
  }

  const [lead, ...others] = articles;
  const sections = groupByCategory(others, categories, STORIES_PER_CATEGORY);

  return (
    <div className="page">
      <div className={styles.front}>
        <LeadStory article={lead} />
        <LatestLine articles={others.slice(0, LATEST_COUNT)} />
      </div>
      <div className={styles.sections}>
        {sections.map((section) => (
          <CategorySection key={section.category.id} section={section} />
        ))}
      </div>
    </div>
  );
}
