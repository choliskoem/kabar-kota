"use client";

import { useState } from "react";
import styles from "./article.module.css";

const FEEDBACK_MS = 2000;

type ShareState = "idle" | "copied" | "shared";

const LABEL: Record<ShareState, string> = {
  idle: "Bagikan",
  copied: "Tautan disalin",
  shared: "Terkirim, makasih!",
};

/** Membuka menu bagikan bawaan HP; di desktop menyalin tautan. */
export function ShareButton({ title, path }: { title: string; path: string }) {
  const [state, setState] = useState<ShareState>("idle");

  function showFeedback(next: ShareState) {
    setState(next);
    setTimeout(() => setState("idle"), FEEDBACK_MS);
  }

  async function handleShare() {
    const url = new URL(path, window.location.origin).toString();

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        showFeedback("shared");
      } catch {
        // Pengguna menutup menu bagikan; tidak perlu ditangani.
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    showFeedback("copied");
  }

  return (
    <button type="button" className={styles.shareButton} onClick={handleShare} data-state={state}>
      <span aria-live="polite">{LABEL[state]}</span>
    </button>
  );
}