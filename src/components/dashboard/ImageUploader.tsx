"use client";

import { useEffect, useState } from "react";
import { publicImageUrl } from "@/lib/media-url";
import { uploadNewsImage, validateSourceImage, ACCEPTED_IMAGE_TYPES } from "@/services/media";
import type { Media } from "@/types/domain";
import styles from "./dashboard.module.css";

interface ImageUploaderProps {
  value: Media | null;
  onChange: (media: Media | null) => void;
}

type UploadState = { kind: "idle" } | { kind: "uploading" } | { kind: "error"; message: string };

/**
 * Pilih foto → isi keterangan → unggah. Gambar dikompres ke WebP di browser
 * sebelum dikirim. Input di sini sengaja tanpa atribut name agar tidak ikut
 * terkirim bersama formulir berita.
 */
export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [credit, setCredit] = useState("");
  const [state, setState] = useState<UploadState>({ kind: "idle" });

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    if (!selected) return;

    const error = validateSourceImage(selected);
    if (error) {
      setState({ kind: "error", message: error });
      event.target.value = "";
      return;
    }
    setState({ kind: "idle" });
    setFile(selected);
  }

  async function handleUpload() {
    if (!file) return;
    if (altText.trim().length < 3) {
      setState({ kind: "error", message: "Isi deskripsi gambar untuk pembaca tunanetra (minimal 3 karakter)." });
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

  return (
    <fieldset className={styles.uploader}>
      <legend>Foto sampul</legend>

      {value && !file && (
        <div className={styles.currentCover}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={publicImageUrl(value.thumbPath)} alt={value.altText} />
          <div>
            <p>{value.altText}</p>
            {value.credit && <p className={styles.hint}>Foto: {value.credit}</p>}
            <button type="button" className={styles.linkButton} onClick={() => onChange(null)}>
              Hapus foto sampul
            </button>
          </div>
        </div>
      )}

      <label className={styles.field}>
        <span>{value ? "Ganti foto" : "Pilih foto"}</span>
        <input type="file" accept={ACCEPTED_IMAGE_TYPES.join(",")} onChange={handleFileChange} disabled={isUploading} />
        <span className={styles.hint}>JPG, PNG, atau WebP. Otomatis dikecilkan dan diubah ke WebP.</span>
      </label>

      {file && previewUrl && (
        <div className={styles.pending}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" className={styles.preview} />
          <div className={styles.pendingFields}>
            <label className={styles.field}>
              <span>Deskripsi gambar (wajib)</span>
              <input value={altText} onChange={(e) => setAltText(e.target.value)} maxLength={200} />
            </label>
            <label className={styles.field}>
              <span>Keterangan foto</span>
              <input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={300} />
            </label>
            <label className={styles.field}>
              <span>Kredit fotografer</span>
              <input value={credit} onChange={(e) => setCredit(e.target.value)} maxLength={80} />
            </label>
            <div className={styles.actions}>
              <button type="button" className={styles.primaryButton} onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "Mengunggah..." : "Unggah foto"}
              </button>
              <button type="button" className={styles.linkButton} onClick={resetSelection} disabled={isUploading}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {state.kind === "error" && (
        <p role="alert" className={styles.error}>
          {state.message}
        </p>
      )}
    </fieldset>
  );
}
