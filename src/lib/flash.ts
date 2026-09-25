import type { ArticleStatus } from "@/types/domain";

/** Pesan singkat yang tampil di dashboard setelah berpindah halaman (lewat ?pesan=...). */
export const flashMessages = {
  draf: "Draf tersimpan.",
  dikirim: "Berita dikirim ke editor untuk ditinjau.",
  terbit: "Berita sudah terbit dan tampil di situs.",
} as const;

export type FlashKey = keyof typeof flashMessages;

export function isFlashKey(value: string | undefined): value is FlashKey {
  return value !== undefined && value in flashMessages;
}

const flashKeyByStatus: Record<ArticleStatus, FlashKey> = {
  draft: "draf",
  review: "dikirim",
  published: "terbit",
};

export function flashKeyForStatus(status: ArticleStatus): FlashKey {
  return flashKeyByStatus[status];
}