"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "kk-seen-stories";
/** Cukup simpan id story terakhir; yang lama sudah tidak tampil di beranda. */
const MAX_REMEMBERED = 200;

function readSeen(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Mengingat story yang sudah dilihat di browser ini, agar lingkarannya berubah abu-abu. */
export function useSeenStories() {
  const [seen, setSeen] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setSeen(new Set(readSeen()));
  }, []);

  const markSeen = useCallback((storyId: string) => {
    setSeen((current) => {
      if (current.has(storyId)) return current;
      const next = new Set(current).add(storyId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next].slice(-MAX_REMEMBERED)));
      } catch {
        // Penyimpanan ditolak (mode privat); penanda hanya berlaku selama halaman terbuka.
      }
      return next;
    });
  }, []);

  const isSeen = useCallback((storyId: string) => seen.has(storyId), [seen]);

  return { isSeen, markSeen };
}