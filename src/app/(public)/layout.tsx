import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getCategories } from "@/services/articles";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <>
      <SmoothScroll />
      <SiteHeader categories={categories} />
      <main>{children}</main>
      <SiteFooter categories={categories} />
    </>
  );
}
