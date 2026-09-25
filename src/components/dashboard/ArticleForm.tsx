"use client";

import { useActionState, useState } from "react";
import { saveArticleAction } from "@/app/dashboard/actions";
import type { Article, Category, Media } from "@/types/domain";
import { initialArticleFormState, type ArticleField } from "@/validation/article-form-state";
import { ImageUploader } from "./ImageUploader";
import styles from "./dashboard.module.css";

interface ArticleFormProps {
  categories: Category[];
  canPublish: boolean;
  article?: Article;
}

export function ArticleForm({ categories, canPublish, article }: ArticleFormProps) {
  const [state, formAction, isPending] = useActionState(saveArticleAction, initialArticleFormState);
  const [cover, setCover] = useState<Media | null>(article?.cover ?? null);

  const errorFor = (field: ArticleField) =>
    state.fieldErrors[field] && (
      <span id={`${field}-error`} className={styles.error}>
        {state.fieldErrors[field]}
      </span>
    );

  const describedBy = (field: ArticleField) =>
    state.fieldErrors[field] ? `${field}-error` : undefined;

  return (
    <form action={formAction} className={styles.form}>
      {article && <input type="hidden" name="id" value={article.id} />}
      <input type="hidden" name="coverMediaId" value={cover?.id ?? ""} />

      <label className={styles.field}>
        <span>Judul</span>
        <input
          name="title"
          defaultValue={article?.title}
          maxLength={160}
          required
          aria-describedby={describedBy("title")}
          className={styles.titleInput}
        />
        {errorFor("title")}
      </label>

      <label className={styles.field}>
        <span>Ringkasan</span>
        <textarea
          name="excerpt"
          defaultValue={article?.excerpt}
          rows={2}
          maxLength={300}
          required
          aria-describedby={describedBy("excerpt")}
        />
        <span className={styles.hint}>Satu atau dua kalimat yang tampil di beranda.</span>
        {errorFor("excerpt")}
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span>Kategori</span>
          <select
            name="categoryId"
            defaultValue={article?.category.id ?? ""}
            required
            aria-describedby={describedBy("categoryId")}
          >
            <option value="" disabled>
              Pilih kategori
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errorFor("categoryId")}
        </label>

        <label className={styles.field}>
          <span>Tag</span>
          <input
            name="tags"
            defaultValue={article?.tags.map((tag) => tag.name).join(", ")}
            placeholder="Transportasi, Anak Muda"
            aria-describedby={describedBy("tags")}
          />
          <span className={styles.hint}>Pisahkan dengan koma, maksimal 8.</span>
          {errorFor("tags")}
        </label>
      </div>

      <ImageUploader value={cover} onChange={setCover} />

      <label className={styles.field}>
        <span>Isi berita</span>
        <textarea
          name="body"
          defaultValue={article?.body}
          rows={16}
          required
          aria-describedby={describedBy("body")}
          className={styles.bodyInput}
        />
        <span className={styles.hint}>Pisahkan paragraf dengan satu baris kosong.</span>
        {errorFor("body")}
      </label>

      {state.message && (
        <p role="alert" className={styles.error}>
          {state.message}
        </p>
      )}

      <div className={styles.actions}>
        <button type="submit" name="status" value="draft" disabled={isPending} className={styles.secondaryButton}>
          Simpan draf
        </button>
        {canPublish ? (
          <button type="submit" name="status" value="published" disabled={isPending} className={styles.primaryButton}>
            Terbitkan
          </button>
        ) : (
          <button type="submit" name="status" value="review" disabled={isPending} className={styles.primaryButton}>
            Kirim ke editor
          </button>
        )}
        {isPending && <span className={styles.hint}>Menyimpan...</span>}
      </div>
    </form>
  );
}
