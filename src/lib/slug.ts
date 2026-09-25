export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Slug artikel diberi akhiran acak pendek supaya judul yang mirip tidak bentrok. */
export function createArticleSlug(title: string): string {
  const suffix = crypto.randomUUID().slice(0, 6);
  return `${slugify(title)}-${suffix}`;
}
