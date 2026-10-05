"use client";

import { useEffect, useState, useTransition, type CSSProperties } from "react";
import { reactToArticleAction } from "@/app/(public)/berita/[slug]/actions";
import { REACTIONS, REACTION_KINDS, applyReactionChange } from "@/lib/reactions";
import type { ReactionCounts, ReactionKind } from "@/types/domain";
import styles from "./article.module.css";

/** Reaksi yang pernah dipilih pengunjung disimpan di browser agar tombolnya tetap menyala. */
const STORAGE_KEY = "kk-reactions";
const BURST_PARTICLES = 6;

function readStoredReactions(): Record<string, ReactionKind> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function readStoredReaction(articleId: string): ReactionKind | null {
  const stored = readStoredReactions()[articleId];
  return REACTION_KINDS.includes(stored) ? stored : null;
}

function storeReaction(articleId: string, reaction: ReactionKind | null) {
  try {
    const reactions = readStoredReactions();
    if (reaction) reactions[articleId] = reaction;
    else delete reactions[articleId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reactions));
  } catch {
    // Browser menolak penyimpanan (mode privat); reaksi tetap tersimpan di server.
  }
}

interface ReactionBarProps {
  articleId: string;
  initialCounts: ReactionCounts;
}

export function ReactionBar({ articleId, initialCounts }: ReactionBarProps) {
  const [counts, setCounts] = useState(initialCounts);
  const [mine, setMine] = useState<ReactionKind | null>(null);
  const [burst, setBurst] = useState<{ kind: ReactionKind; id: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMine(readStoredReaction(articleId));
  }, [articleId]);

  function handleReact(kind: ReactionKind) {
    const next = mine === kind ? null : kind;
    const previous = { counts, mine };

    // Tampilkan hasilnya langsung, lalu samakan dengan jawaban server.
    setCounts(applyReactionChange(counts, mine, next));
    setMine(next);
    storeReaction(articleId, next);
    setMessage(null);
    if (next) setBurst({ kind: next, id: Date.now() });

    startTransition(async () => {
      const result = await reactToArticleAction(articleId, next);
      if (result.ok) {
        setCounts(result.counts);
        return;
      }
      setCounts(previous.counts);
      setMine(previous.mine);
      storeReaction(articleId, previous.mine);
      setMessage(result.message);
    });
  }

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <section className={styles.reactions} aria-labelledby="reaksi-heading">
      <div className={styles.reactionsHead}>
        <h2 id="reaksi-heading" className={styles.reactionsTitle}>
          Gimana menurutmu?
        </h2>
        <span className={styles.reactionsTotal}>{total > 0 ? `${total} reaksi` : "Jadi yang pertama"}</span>
      </div>

      <div className={styles.reactionList}>
        {REACTIONS.map(({ kind, emoji, label }) => {
          const isMine = mine === kind;
          return (
            <button
              key={kind}
              type="button"
              className={styles.reaction}
              aria-pressed={isMine}
              aria-label={`${label}, ${counts[kind]} reaksi`}
              onClick={() => handleReact(kind)}
            >
              <span className={styles.reactionEmoji} aria-hidden="true">
                {emoji}
              </span>
              <span className={styles.reactionCount} aria-hidden="true">
                {counts[kind]}
              </span>
              {burst?.kind === kind && (
                <span key={burst.id} className={styles.burst} aria-hidden="true">
                  {Array.from({ length: BURST_PARTICLES }, (_, index) => (
                    <span key={index} style={{ "--i": index } as CSSProperties}>
                      {emoji}
                    </span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {message && (
        <p role="alert" className={styles.reactionError}>
          {message}
        </p>
      )}
    </section>
  );
}