import { z } from "zod";
import { normalizeLineBreaks } from "@/lib/format";
import { POLL_MIN_OPTIONS } from "@/lib/polls";
import type { ArticleFormState } from "@/validation/article-form-state";

const MAX_TAGS = 8;
export const HIGHLIGHT_MAX = 140;
export const POLL_QUESTION_MAX = 140;
export const POLL_OPTION_MAX = 60;

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

/** Isian opsional: boleh kosong, tapi bila diisi harus memenuhi panjang minimal & maksimal. */
function optionalText(min: number, max: number, label: string) {
  return z
    .string()
    .trim()
    .default("")
    .refine((value) => value === "" || value.length >= min, `${label} minimal ${min} karakter.`)
    .refine((value) => value.length <= max, `${label} maksimal ${max} karakter.`);
}

export const articleStatusSchema = z.enum(["draft", "review", "published"]);

/**
 * Bentuk isian formulir (nama field = atribut name di <input>).
 * Hasil akhirnya diubah menjadi ArticleInput yang lebih rapi lewat transform di bawah.
 */
const articleFormSchema = z
  .object({
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
    body: z.string().trim().min(50, "Isi berita minimal 50 karakter.").transform(normalizeLineBreaks),
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
    highlight1: optionalText(5, HIGHLIGHT_MAX, "Poin"),
    highlight2: optionalText(5, HIGHLIGHT_MAX, "Poin"),
    highlight3: optionalText(5, HIGHLIGHT_MAX, "Poin"),
    pollQuestion: optionalText(5, POLL_QUESTION_MAX, "Pertanyaan"),
    pollOption1: optionalText(1, POLL_OPTION_MAX, "Pilihan"),
    pollOption2: optionalText(1, POLL_OPTION_MAX, "Pilihan"),
    pollOption3: optionalText(1, POLL_OPTION_MAX, "Pilihan"),
    pollOption4: optionalText(1, POLL_OPTION_MAX, "Pilihan"),
    status: articleStatusSchema,
  })
  .superRefine((form, context) => {
    const options = [form.pollOption1, form.pollOption2, form.pollOption3, form.pollOption4].filter(Boolean);
    if (form.pollQuestion && options.length < POLL_MIN_OPTIONS) {
      context.addIssue({
        code: "custom",
        path: ["pollOption1"],
        message: `Isi minimal ${POLL_MIN_OPTIONS} pilihan jawaban.`,
      });
    }
    if (!form.pollQuestion && options.length > 0) {
      context.addIssue({ code: "custom", path: ["pollQuestion"], message: "Tulis pertanyaan pollingnya dulu." });
    }
  });

export const articleInputSchema = articleFormSchema.transform(
  ({
    highlight1,
    highlight2,
    highlight3,
    pollQuestion,
    pollOption1,
    pollOption2,
    pollOption3,
    pollOption4,
    ...article
  }) => ({
    ...article,
    highlights: [highlight1, highlight2, highlight3].filter(Boolean),
    poll: pollQuestion
      ? { question: pollQuestion, options: [pollOption1, pollOption2, pollOption3, pollOption4].filter(Boolean) }
      : null,
  }),
);

export type ArticleInput = z.output<typeof articleInputSchema>;
export type PollInput = NonNullable<ArticleInput["poll"]>;
/** Nama-nama isian formulir, dipakai untuk menempelkan pesan error ke isian yang tepat. */
export type ArticleField = keyof z.input<typeof articleFormSchema>;

export function toFieldErrors(error: z.ZodError): ArticleFormState["fieldErrors"] {
  const fieldErrors: ArticleFormState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as ArticleField | undefined;
    // Simpan pesan pertama per isian.
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return fieldErrors;
}