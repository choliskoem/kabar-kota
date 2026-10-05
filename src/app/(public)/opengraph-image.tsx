import { BRAND_DARK, SHARE_CARD_SIZE, renderShareCard } from "@/lib/og/share-card";
import { siteConfig } from "@/lib/site";
import { getCategories } from "@/services/articles";

export const alt = siteConfig.name;
export const size = SHARE_CARD_SIZE;
export const contentType = "image/png";

export default async function HomeShareImage() {
  const categories = await getCategories();

  return renderShareCard({
    title: siteConfig.description,
    label: "Berita kota",
    color: BRAND_DARK,
    details: categories.slice(0, 4).map(({ name }) => name),
    routeColors: categories.map(({ color }) => color),
  });
}