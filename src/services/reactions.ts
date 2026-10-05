// Membaca & menulis reaksi emoji. Penulisan selalu lewat fungsi database
// set_article_reaction, karena tabelnya tidak bisa ditulis langsung oleh publik.
import { toReactionCounts } from "@/lib/reactions";
import { createPublicSupabase } from "@/lib/supabase/public";
import type { ReactionCounts, ReactionKind } from "@/types/domain";

export async function getReactionCounts(articleId: string): Promise<ReactionCounts> {
  const { data, error } = await createPublicSupabase()
    .from("article_reaction_counts")
    .select("reaction, total")
    .eq("article_id", articleId);

  if (error) throw new Error(`Gagal memuat reaksi: ${error.message}`);
  const rows = data as { reaction: ReactionKind; total: number }[];
  return toReactionCounts(rows.map(({ reaction, total }) => ({ kind: reaction, total })));
}

export async function setReaction(
  articleId: string,
  visitorId: string,
  reaction: ReactionKind | null,
): Promise<ReactionCounts> {
  const { data, error } = await createPublicSupabase().rpc("set_article_reaction", {
    p_article_id: articleId,
    p_visitor_id: visitorId,
    p_reaction: reaction,
  });

  if (error) throw new Error(`Gagal menyimpan reaksi: ${error.message}`);
  return toReactionCounts(data as { kind: ReactionKind; total: number }[]);
}