import type { Metadata } from "next";
import { SwipeFeed } from "@/components/swipe/SwipeFeed";
import { buildSwipeCards } from "@/lib/swipe";
import { getSwipeFeed } from "@/services/articles";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Mode swipe",
  description: "Geser untuk baca berita kota, satu per satu.",
};

const FEED_SIZE = 30;

/** Halaman layar penuh tanpa header situs, seperti aplikasi video pendek. */
export default async function SwipePage() {
  const cards = buildSwipeCards(await getSwipeFeed(FEED_SIZE));
  return <SwipeFeed cards={cards} />;
}