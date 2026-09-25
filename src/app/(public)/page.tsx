import Link from "next/link";
import { CategoryRail } from "@/components/news/CategoryRail";
import { LatestLine } from "@/components/news/LatestLine";
import { PosterStory } from "@/components/news/PosterStory";
import { TrendingTags } from "@/components/news/TrendingTags";
import { groupByCategory } from "@/lib/news";
import { getCategories, getLatestArticles, getTrendingTags } from "@/services/articles";
import styles from "./home.module.css";

export const revalidate = 60;

const LATEST_COUNT = 5;
const STORIES_PER_CATEGORY = 3;
const TRENDING_COUNT = 10;

export default async function HomePage() {
  const [articles, categories, trendingTags] = await Promise.all([
    getLatestArticles(40),
    getCategories(),
    getTrendingTags(TRENDING_COUNT),
  ]);

  if (articles.length === 0) {
    return (
      <div className={`page ${styles.empty}`}>
        <h1>Belum ada berita yang terbit</h1>
        <p>Tulis berita pertama dari dashboard redaksi, lalu terbitkan supaya muncul di sini.</p>
        <Link href="/dashboard/artikel/baru">Tulis berita</Link>
      </div>
    );
  }

  const [lead, ...others] = articles;
  const sections = groupByCategory(others, categories, STORIES_PER_CATEGORY);

  return (
    <div className={`page ${styles.home}`}>
      <div className={styles.front}>
        <PosterStory article={lead} />
        <div className={styles.side}>
          <LatestLine articles={others.slice(0, LATEST_COUNT)} />
          <TrendingTags tags={trendingTags} />
        </div>
      </div>
      {sections.map((section) => (
        <CategoryRail key={section.category.id} section={section} />
      ))}
    </div>
  );
}
