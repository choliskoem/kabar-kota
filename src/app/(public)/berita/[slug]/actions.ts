"use server";

import { z } from "zod";
import { REACTION_KINDS } from "@/lib/reactions";
import { getOrCreateVisitorId } from "@/lib/visitor";
import { castPollVote } from "@/services/polls";
import { setReaction } from "@/services/reactions";
import type { ReactionCounts } from "@/types/domain";

const reactionInputSchema = z.object({
  articleId: z.uuid(),
  reaction: z.enum(REACTION_KINDS).nullable(),
});

const voteInputSchema = z.object({
  pollId: z.uuid(),
  optionId: z.number().int().positive(),
});

export type ReactionResult = { ok: true; counts: ReactionCounts } | { ok: false; message: string };

export type VoteResult =
  | { ok: true; results: { optionId: number; votes: number }[] }
  | { ok: false; message: string };

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

/** Menyimpan atau mengganti suara pengunjung di polling. */
export async function votePollAction(pollId: string, optionId: number): Promise<VoteResult> {
  const parsed = voteInputSchema.safeParse({ pollId, optionId });
  if (!parsed.success) return { ok: false, message: "Pilihan tidak valid." };

  try {
    const visitorId = await getOrCreateVisitorId();
    const results = await castPollVote(parsed.data.pollId, visitorId, parsed.data.optionId);
    return { ok: true, results };
  } catch {
    return { ok: false, message: "Suara gagal tersimpan. Coba lagi sebentar." };
  }
}