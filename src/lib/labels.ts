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
