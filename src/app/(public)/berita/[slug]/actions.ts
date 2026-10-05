"use server";

import { z } from "zod";
import { REACTION_KINDS } from "@/lib/reactions";
import { getOrCreateVisitorId } from "@/lib/visitor";
import { setReaction } from "@/services/reactions";
import type { ReactionCounts } from "@/types/domain";

const reactionInputSchema = z.object({
  articleId: z.uuid(),
  reaction: z.enum(REACTION_KINDS).nullable(),
});

export type ReactionResult = { ok: true; counts: ReactionCounts } | { ok: false; message: string };

/** Menyimpan, mengganti, atau menghapus (reaction = null) reaksi pengunjung. */
export async function reactToArticleAction(articleId: string, reaction: string | null): Promise<ReactionResult> {
  const parsed = reactionInputSchema.safeParse({ articleId, reaction });
  if (!parsed.success) return { ok: false, message: "Reaksi tidak valid." };

  try {
    const visitorId = await getOrCreateVisitorId();
    const counts = await setReaction(parsed.data.articleId, visitorId, parsed.data.reaction);
    return { ok: true, counts };
  } catch {
    return { ok: false, message: "Reaksi gagal tersimpan. Coba lagi sebentar." };
  }
}