import { z } from "zod";
import type { ArticleFormState } from "@/validation/article-form-state";

const MAX_TAGS = 8;

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

function parseTagNames(raw: string): string[] {
  const seen = new Set<string>();
  return raw
    .split(",")
    .map((name) => name.trim().replace(/\s+/g, " "))
    .filter((name) => {
      const key = name.toLowerCase();
      if (!name || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export const articleStatusSchema = z.enum(["draft", "review", "published"]);

export const articleInputSchema = z.object({
  id: z.preprocess(emptyToUndefined, z.uuid().optional()),
  title: z
    .string()
    .trim()
    .min(10, "Judul minimal 10 karakter.")
    .max(160, "Judul maksimal 160 karakter."),
  excerpt: z
    .string()
    .trim()
    .min(20, "Ringkasan minimal 20 karakter.")
    .max(300, "Ringkasan maksimal 300 karakter."),
  body: z.string().trim().min(50, "Isi berita minimal 50 karakter."),
  categoryId: z.coerce.number().int().positive("Pilih kategori."),
  coverMediaId: z.preprocess(emptyToUndefined, z.uuid().optional()),
  tags: z
    .string()
    .default("")
    .transform(parseTagNames)
    .pipe(
      z
        .array(z.string().min(2, "Setiap tag minimal 2 karakter.").max(40, "Tag maksimal 40 karakter."))
        .max(MAX_TAGS, `Maksimal ${MAX_TAGS} tag.`),
    ),
  status: articleStatusSchema,
});

export type ArticleInput = z.infer<typeof articleInputSchema>;

export function toFieldErrors(error: z.ZodError<ArticleInput>): ArticleFormState["fieldErrors"] {
  const { fieldErrors } = z.flattenError(error);
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, messages]) => [field, messages?.[0]]),
  ) as ArticleFormState["fieldErrors"];
}
