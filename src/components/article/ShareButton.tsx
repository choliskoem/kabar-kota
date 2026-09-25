"use client";

import { useState } from "react";
import styles from "./article.module.css";

const COPIED_MESSAGE_MS = 2000;

/** Membuka menu bagikan bawaan HP; di desktop menyalin tautan. */
export function ShareButton({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = new URL(path, window.location.origin).toString();

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Pengguna menutup menu bagikan; tidak perlu ditangani.
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_MESSAGE_MS);
  }

  return (
    <button type="button" className={styles.shareButton} onClick={handleShare}>
      <span aria-live="polite">{copied ? "Tautan disalin" : "Bagikan"}</span>
    </button>
  );
}
