import type { ArticleStatus, UserRole } from "@/types/domain";

export const roleLabel: Record<UserRole, string> = {
  reader: "Pembaca",
  writer: "Penulis",
  editor: "Editor",
  admin: "Admin",
};

export const statusLabel: Record<ArticleStatus, string> = {
  draft: "Draf",
  review: "Menunggu editor",
  published: "Terbit",
};

/** Penjelasan singkat tiap status untuk penulis dan editor. */
export const statusHint: Record<ArticleStatus, string> = {
  draft: "Hanya terlihat oleh kamu dan editor.",
  review: "Menunggu editor memeriksa dan menerbitkan.",
  published: "Sudah tampil di situs untuk semua pembaca.",
};

export function isArticleStatus(value: string | undefined): value is ArticleStatus {
  return value !== undefined && value in statusLabel;
}