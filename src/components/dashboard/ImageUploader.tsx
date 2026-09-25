"use client";

import { useEffect, useId, useState, type DragEvent } from "react";
import { publicImageUrl } from "@/lib/media-url";
import { ACCEPTED_IMAGE_TYPES, uploadNewsImage, validateSourceImage } from "@/services/media";
import type { Media } from "@/types/domain";
import styles from "./dashboard.module.css";

interface ImageUploaderProps {
  value: Media | null;
  onChange: (media: Media | null) => void;
}

type UploadState = { kind: "idle" } | { kind: "uploading" } | { kind: "error"; message: string };

/**
 * Tarik-lepas atau pilih foto → isi keterangan → unggah. Gambar dikompres ke WebP
 * di browser. Input di sini sengaja tanpa atribut name agar tidak ikut terkirim
 * bersama formulir berita.
 */
export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [credit, setCredit] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [state, setState] = useState<UploadState>({ kind: "idle" });

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function selectFile(selected: File) {
    const error = validateSourceImage(selected);
    if (error) {
      setState({ kind: "error", message: error });
      return;
    }
    setState({ kind: "idle" });
    setFile(selected);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) selectFile(dropped);
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  async function handleUpload() {
    if (!file) return;
    if (altText.trim().length < 3) {
      setState({ kind: "error", message: "Isi deskripsi foto dulu (minimal 3 karakter)." });
      return;
    }

    setState({ kind: "uploading" });
    try {
      const media = await uploadNewsImage(file, { altText, caption, credit });
      onChange(media);
      resetSelection();
    } catch (error) {
      setState({ kind: "error", message: (error as Error).message });
    }
  }

  function resetSelection() {
    setFile(null);
    setPreviewUrl(null);
    setAltText("");
    setCaption("");
    setCredit("");
    setState({ kind: "idle" });
  }

  const isUploading = state.kind === "uploading";
  const hasPendingFile = Boolean(file && previewUrl);

  return (
    <div className={styles.uploader}>
      <input
        id={inputId}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className={styles.visuallyHidden}
        disabled={isUploading}
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (selected) selectFile(selected);
          event.target.value = "";
        }}
      />

      {hasPendingFile && (
        <div className={styles.pending}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl!} alt="" className={styles.coverPreview} />
          <div className={styles.field}>
            <label htmlFor={`${inputId}-alt`}>Deskripsi foto (wajib)</label>
            <input
              id={`${inputId}-alt`}
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              maxLength={200}
              placeholder="Mis. Penumpang menunggu bus malam di halte"
            />
            <p className={styles.hint}>Dibacakan untuk pembaca tunanetra dan muncul bila foto gagal dimuat.</p>
          </div>
          <div className={styles.field}>
            <label htmlFor={`${inputId}-caption`}>Keterangan foto</label>
            <input
              id={`${inputId}-caption`}
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              maxLength={300}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor={`${inputId}-credit`}>Kredit fotografer</label>
            <input
              id={`${inputId}-credit`}
              value={credit}
              onChange={(event) => setCredit(event.target.value)}
              maxLength={80}
            />
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.primaryButton} onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Mengompres & mengunggah..." : "Unggah foto"}
            </button>
            <button type="button" className={styles.textButton} onClick={resetSelection} disabled={isUploading}>
              Batal
            </button>
          </div>
        </div>
      )}

      {!hasPendingFile && value && (
        <div className={styles.currentCover}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={publicImageUrl(value.thumbPath)} alt={value.altText} className={styles.coverPreview} />
          <p className={styles.hint}>
            {value.altText}
            {value.credit && ` (Foto: ${value.credit})`}
          </p>
          <div className={styles.actions}>
            <label htmlFor={inputId} className={styles.secondaryButton}>
              Ganti foto
            </label>
            <button type="button" className={`${styles.textButton} ${styles.dangerText}`} onClick={() => onChange(null)}>
              Hapus foto
            </button>
          </div>
        </div>
      )}

      {!hasPendingFile && !value && (
        <label
          htmlFor={inputId}
          className={styles.dropzone}
          data-dragging={isDragging ? "" : undefined}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <strong>Tarik foto ke sini</strong>
          <span>atau klik untuk memilih file</span>
          <span className={styles.hint}>JPG, PNG, atau WebP. Otomatis dikecilkan ke WebP.</span>
        </label>
      )}

      {state.kind === "error" && (
        <p role="alert" className={styles.fieldError}>
          {state.message}
        </p>
      )}
    </div>
  );
}