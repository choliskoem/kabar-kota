import type { Poll, PollVotes } from "@/types/domain";

export const POLL_MIN_OPTIONS = 2;
export const POLL_MAX_OPTIONS = 4;

export function emptyPollVotes(poll: Poll): PollVotes {
  return Object.fromEntries(poll.options.map(({ id }) => [id, 0]));
}

export function toPollVotes(poll: Poll, rows: { optionId: number; votes: number }[]): PollVotes {
  const votes = emptyPollVotes(poll);
  for (const { optionId, votes: count } of rows) votes[optionId] = count;
  return votes;
}

/** Hasil hitungan sementara di browser sebelum server menjawab (optimistic update). */
export function applyVoteChange(votes: PollVotes, previous: number | null, next: number): PollVotes {
  const updated = { ...votes };
  if (previous !== null && previous in updated) updated[previous] = Math.max(0, updated[previous] - 1);
  updated[next] = (updated[next] ?? 0) + 1;
  return updated;
}

export function totalVotes(votes: PollVotes): number {
  return Object.values(votes).reduce((sum, count) => sum + count, 0);
}

/** Persentase dibulatkan; total bisa sedikit meleset dari 100% karena pembulatan, itu wajar. */
export function votePercent(count: number, total: number): number {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}