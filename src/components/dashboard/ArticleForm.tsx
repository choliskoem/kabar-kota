"use client";

import { useActionState, useState, type KeyboardEvent } from "react";
import { saveArticleAction } from "@/app/dashboard/actions";
import { countWords, estimateReadingMinutes, toHashtag } from "@/lib/format";
import { statusHint } from "@/lib/labels";
import type { Article, ArticleStatus, Category, Media } from "@/types/domain";
import { initialArticleFormState } from "@/validation/article-form-state";
import { routeStyle } from "@/components/news/route-style";
import { FormField, describedBy } from "./FormField";
import { ImageUploader } from "./ImageUploader";
import { PendingButton } from "./PendingButton";
import { StatusBadge } from "./StatusBadge";
import { useUnsavedChangesWarning } from "./useUnsavedChangesWarning";
import styles from "./dashboard.module.css";

const TITLE_MAX = 160;
const EXCERPT_MAX = 300;
const TAG_MAX = 8;

interface ArticleFormProps {
  categories: Category[];
  canPublish: boolean;
  article?: Article;
}

interface SubmitOption {
  status: ArticleStatus;
  label: string;
  pendingText: string;
}

function parseTags(raw: string): string[] {
  const names = raw.split(",").map((name) => name.trim()).filter(Boolean);
  return [...new Map(names.map((name) => [name.toLowerCase(), name])).values()];
}

/** Tombol utama dan cadangan menyesuaikan peran dan status berita saat ini. */
function submitOptions(canPublish: boolean, currentStatus?: ArticleStatus): [SubmitOption, SubmitOption] {
  if (canPublish && currentStatus === "published") {
    return [
      { status: "published", label: "Simpan perubahan", pendingText: "Menyimpan..." },
      { status: "draft", label: "Tarik jadi draf", pendingText: "Menarik..." },
    ];
  }
  if (canPublish) {
    return [
      { status: "published", label: "Terbitkan", pendingText: "Menerbitkan..." },
      { status: "draft", label: "Simpan draf", pendingText: "Menyimpan..." },
    ];
  }
  return [
    { status: "review", label: "Kirim ke editor", pendingText: "Mengirim..." },
    { status: "draft", label: "Simpan draf", pendingText: "Menyimpan..." },
  ];
}

/**
 * Menekan Enter di kolom satu baris tidak boleh mengirim formulir, karena tombol
 * pertama adalah "Terbitkan" dan berita bisa terbit tanpa sengaja.
 */
function preventEnterSubmit(event: KeyboardEvent<HTMLFormElement>) {
  const isSingleLineInput = event.target instanceof HTMLInputElement;
  if (event.key === "Enter" && isSingleLineInput) event.preventDefault();
}

function bodyHint(body: string): string {
  const words = countWords(body);
  const paragraphHint = "Pisahkan paragraf dengan satu baris kosong.";
  if (words === 0) return paragraphHint;
  return `${words} kata, sekitar ${estimateReadingMinutes(body)} menit baca. ${paragraphHint}`;
}

export function ArticleForm({ categories, canPublish, article }: ArticleFormProps) {
  const [state, formAction, isPending] = useActionState(saveArticleAction, initialArticleFormState);
  // Semua isian dikontrol lewat state agar tidak terhapus saat server mengembalikan error validasi.
  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [categoryId, setCategoryId] = useState(article ? String(article.category.id) : "");
  const [tags, setTags] = useState(article?.tags.map((tag) => tag.name).join(", ") ?? "");
  const [cover, setCover] = useState<Media | null>(article?.cover ?? null);
  const [isDirty, setIsDirty] = useState(false);

  useUnsavedChangesWarning(isDirty && !isPending);

  const errors = state.fieldErrors;
  const tagNames = parseTags(tags);
  const [primary, secondary] = submitOptions(canPublish, article?.status);

  return (
    <form
      action={formAction}
      className={styles.editor}
      onChange={() => setIsDirty(true)}
      onKeyDown={preventEnterSubmit}
    >
      {article && <input type="hidden" name="id" value={article.id} />}
      <input type="hidden" name="coverMediaId" value={cover?.id ?? ""} />

      <div className={styles.editorMain}>
        {state.message && (
          <p role="alert" className={styles.formAlert}>
            {state.message}
          </p>
        )}

        <FormField
          id="title"
          label="Judul"
          error={errors.title}
          counter={{ current: title.length, max: TITLE_MAX }}
        >
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Tulis judul yang jelas dan singkat"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={describedBy("title", errors.title)}
            className={styles.titleInput}
          />
        </FormField>

        <FormField
          id="excerpt"
          label="Ringkasan"
          hint="Satu atau dua kalimat yang tampil di beranda dan saat dibagikan."
          error={errors.excerpt}
          counter={{ current: excerpt.length, max: EXCERPT_MAX }}
        >
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            aria-invalid={Boolean(errors.excerpt)}
            aria-describedby={describedBy("excerpt", errors.excerpt, true)}
          />
        </FormField>

        <FormField id="body" label="Isi berita" hint={bodyHint(body)} error={errors.body}>
          <textarea
            id="body"
            name="body"
            rows={18}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            aria-invalid={Boolean(errors.body)}
            aria-describedby={describedBy("body", errors.body, true)}
            className={styles.bodyInput}
            data-lenis-prevent
          />
        </FormField>
      </div>

      <aside className={styles.editorSide}>
        <section className={styles.panel} aria-labelledby="panel-status">
          <h2 id="panel-status" className={styles.panelTitle}>
            Status
          </h2>
          {article ? (
            <>
              <StatusBadge status={article.status} />
              <p className={styles.hint}>{statusHint[article.status]}</p>
            </>
          ) : (
            <p className={styles.hint}>Belum disimpan.</p>
          )}
          <div className={styles.submitStack}>
            <PendingButton
              name="status"
              value={primary.status}
              pendingText={primary.pendingText}
              className={styles.primaryButton}
              onClick={() => setIsDirty(false)}
            >
              {primary.label}
            </PendingButton>
            <PendingButton
              name="status"
              value={secondary.status}
              pendingText={secondary.pendingText}
              className={styles.secondaryButton}
              onClick={() => setIsDirty(false)}
            >
              {secondary.label}
            </PendingButton>
          </div>
          <p className={styles.hint}>
            {canPublish
              ? "Berita yang diterbitkan langsung tampil di situs."
              : "Editor akan memeriksa beritamu sebelum terbit."}
          </p>
        </section>

        <section className={styles.panel} aria-labelledby="panel-kategori">
          <h2 id="panel-kategori" className={styles.panelTitle}>
            Kategori
          </h2>
          <div
            className={styles.choiceGroup}
            role="radiogroup"
            aria-labelledby="panel-kategori"
            aria-describedby={describedBy("categoryId", errors.categoryId)}
          >
            {categories.map((category) => (
              <label key={category.id} className={styles.choice} style={routeStyle(category.color)}>
                <input
                  type="radio"
                  name="categoryId"
                  value={category.id}
                  checked={categoryId === String(category.id)}
                  onChange={(event) => setCategoryId(event.target.value)}
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
          {errors.categoryId && (
            <p id="categoryId-error" className={styles.fieldError}>
              {errors.categoryId}
            </p>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="panel-tag">
          <h2 id="panel-tag" className={styles.panelTitle}>
            Tag
          </h2>
          <FormField
            id="tags"
            label="Pisahkan dengan koma"
            error={errors.tags}
            counter={{ current: tagNames.length, max: TAG_MAX }}
          >
            <input
              id="tags"
              name="tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="Transportasi, Anak Muda"
              aria-invalid={Boolean(errors.tags)}
              aria-describedby={describedBy("tags", errors.tags)}
            />
          </FormField>
          {tagNames.length > 0 && (
            <ul className={styles.tagPreview} aria-label="Pratinjau tag">
              {tagNames.map((name) => (
                <li key={name}>{toHashtag(name)}</li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="panel-foto">
          <h2 id="panel-foto" className={styles.panelTitle}>
            Foto sampul
          </h2>
          <ImageUploader
            value={cover}
            onChange={(media) => {
              setCover(media);
              setIsDirty(true);
            }}
          />
        </section>
      </aside>
    </form>
  );
}