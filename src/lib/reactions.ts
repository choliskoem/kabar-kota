import type { ReactionCounts, ReactionKind } from "@/types/domain";

export interface ReactionOption {
  kind: ReactionKind;
  emoji: string;
  label: string;
}

/** Urutan tampil reaksi di bawah berita. */
export const REACTIONS: ReactionOption[] = [
  { kind: "fire", emoji: "🔥", label: "Keren" },
  { kind: "wow", emoji: "😮", label: "Kaget" },
  { kind: "haha", emoji: "😂", label: "Lucu" },
  { kind: "sad", emoji: "😢", label: "Sedih" },
  { kind: "angry", emoji: "😡", label: "Kesal" },
];

export const REACTION_KINDS = REACTIONS.map(({ kind }) => kind) as [ReactionKind, ...ReactionKind[]];

export function emptyReactionCounts(): ReactionCounts {
  return { fire: 0, wow: 0, haha: 0, sad: 0, angry: 0 };
}

export function toReactionCounts(rows: { kind: ReactionKind; total: number }[]): ReactionCounts {
  const counts = emptyReactionCounts();
  for (const { kind, total } of rows) counts[kind] = total;
  return counts;
}

/** Hasil hitungan sementara di browser sebelum server menjawab (optimistic update). */
export function applyReactionChange(
  counts: ReactionCounts,
  previous: ReactionKind | null,
  next: ReactionKind | null,
): ReactionCounts {
  const updated = { ...counts };
  if (previous) updated[previous] = Math.max(0, updated[previous] - 1);
  if (next) updated[next] += 1;
  return updated;
}