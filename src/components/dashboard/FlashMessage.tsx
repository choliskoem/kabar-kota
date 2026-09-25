"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";

const AUTO_HIDE_MS = 6000;

/**
 * Pesan berhasil setelah menyimpan. Parameter ?pesan dihapus dari URL lewat
 * history.replaceState (tanpa memuat ulang halaman), supaya pesan tidak muncul
 * lagi saat halaman di-refresh.
 */
export function FlashMessage({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("pesan");
    window.history.replaceState(window.history.state, "", url);

    const timer = setTimeout(() => setIsVisible(false), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div role="status" className={styles.flash}>
      <span>{message}</span>
      <button type="button" className={styles.flashClose} onClick={() => setIsVisible(false)}>
        Tutup
      </button>
    </div>
  );
}