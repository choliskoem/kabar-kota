// Membaca & menulis suara polling. Penulisan selalu lewat fungsi database
// cast_poll_vote, karena tabel suara tidak bisa ditulis langsung oleh publik.
import { toPollVotes } from "@/lib/polls";
import { createPublicSupabase } from "@/lib/supabase/public";
import type { Poll, PollVotes } from "@/types/domain";

export async function getPollVotes(poll: Poll): Promise<PollVotes> {
  const { data, error } = await createPublicSupabase()
    .from("poll_results")
    .select("option_id, votes")
    .eq("poll_id", poll.id);

  if (error) throw new Error(`Gagal memuat hasil polling: ${error.message}`);
  const rows = data as { option_id: number; votes: number }[];
  return toPollVotes(poll, rows.map(({ option_id, votes }) => ({ optionId: option_id, votes })));
}

export async function castPollVote(
  pollId: string,
  visitorId: string,
  optionId: number,
): Promise<{ optionId: number; votes: number }[]> {
  const { data, error } = await createPublicSupabase().rpc("cast_poll_vote", {
    p_poll_id: pollId,
    p_visitor_id: visitorId,
    p_option_id: optionId,
  });

  if (error) throw new Error(`Gagal menyimpan suara: ${error.message}`);
  return (data as { option_id: number; votes: number }[]).map(({ option_id, votes }) => ({
    optionId: option_id,
    votes,
  }));
}