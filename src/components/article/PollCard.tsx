"use client";

import { useEffect, useState, useTransition, type CSSProperties } from "react";
import { votePollAction } from "@/app/(public)/berita/[slug]/actions";
import { applyVoteChange, toPollVotes, totalVotes, votePercent } from "@/lib/polls";
import type { Poll, PollVotes } from "@/types/domain";
import styles from "./article.module.css";

/** Pilihan pengunjung disimpan di browser agar hasilnya langsung tampil saat kembali. */
const STORAGE_KEY = "kk-poll-votes";

function readStoredVotes(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function storeVote(pollId: string, optionId: number | null) {
  try {
    const votes = readStoredVotes();
    if (optionId === null) delete votes[pollId];
    else votes[pollId] = optionId;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  } catch {
    // Browser menolak penyimpanan (mode privat); suara tetap tersimpan di server.
  }
}

interface PollCardProps {
  poll: Poll;
  initialVotes: PollVotes;
}

/**
 * Sebelum memilih, hasil disembunyikan supaya pilihan pembaca tidak terpengaruh.
 * Setelah memilih, bar persentase tumbuh, dan pembaca masih boleh mengganti pilihannya.
 */
export function PollCard({ poll, initialVotes }: PollCardProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [mine, setMine] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const stored = readStoredVotes()[poll.id];
    const isValidOption = poll.options.some(({ id }) => id === stored);
    setMine(isValidOption ? stored : null);
  }, [poll]);

  function handleVote(optionId: number) {
    if (optionId === mine) return;
    const previous = { votes, mine };

    // Tampilkan hasilnya langsung, lalu samakan dengan jawaban server.
    setVotes(applyVoteChange(votes, mine, optionId));
    setMine(optionId);
    storeVote(poll.id, optionId);
    setMessage(null);

    startTransition(async () => {
      const result = await votePollAction(poll.id, optionId);
      if (result.ok) {
        setVotes(toPollVotes(poll, result.results));
        return;
      }
      setVotes(previous.votes);
      setMine(previous.mine);
      storeVote(poll.id, previous.mine);
      setMessage(result.message);
    });
  }

  const hasVoted = mine !== null;
  const total = totalVotes(votes);
  const leader = Math.max(...Object.values(votes));

  return (
    <section className={styles.poll} aria-labelledby="polling-heading" data-voted={hasVoted ? "" : undefined}>
      <p className={styles.pollEyebrow}>Polling</p>
      <h2 id="polling-heading" className={styles.pollQuestion}>
        {poll.question}
      </h2>

      <div className={styles.pollOptions} role="radiogroup" aria-labelledby="polling-heading">
        {poll.options.map((option) => {
          const count = votes[option.id] ?? 0;
          const percent = votePercent(count, total);
          const isMine = option.id === mine;
          const isLeading = hasVoted && count > 0 && count === leader;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isMine}
              className={styles.pollOption}
              data-leading={isLeading ? "" : undefined}
              style={{ "--percent": `${hasVoted ? percent : 0}%` } as CSSProperties}
              onClick={() => handleVote(option.id)}
            >
              <span className={styles.pollBar} aria-hidden="true" />
              <span className={styles.pollLabel}>
                {option.label}
                {isMine && <span className={styles.pollMine}>Pilihanmu</span>}
              </span>
              {hasVoted && <span className={styles.pollPercent}>{percent}%</span>}
            </button>
          );
        })}
      </div>

      <p className={styles.pollFooter} aria-live="polite">
        {hasVoted
          ? `${total} suara. Ketuk pilihan lain kalau berubah pikiran.`
          : total > 0
            ? `${total} orang sudah memilih. Pilih dulu untuk melihat hasilnya.`
            : "Jadi yang pertama memilih."}
      </p>

      {message && (
        <p role="alert" className={styles.reactionError}>
          {message}
        </p>
      )}
    </section>
  );
}