"use client";

import { useEffect } from "react";
import { useSpeechReader } from "./useSpeechReader";
import styles from "./article.module.css";

const SPEAKING_ATTRIBUTE = "data-speaking";
/** Ruang yang tertutup header di atas dan mini-player di bawah. */
const VIEWPORT_MARGIN_TOP = 120;
const VIEWPORT_MARGIN_BOTTOM = 140;

function isOutsideViewport(element: Element): boolean {
  const { top, bottom } = element.getBoundingClientRect();
  return top < VIEWPORT_MARGIN_TOP || bottom > window.innerHeight - VIEWPORT_MARGIN_BOTTOM;
}

/**
 * Menyorot bagian artikel yang sedang dibacakan (elemen bertanda data-speech-index)
 * dan menggulir ke sana bila bagian itu berada di luar layar.
 */
function useHighlightSegment(segmentIndex: number, isActive: boolean) {
  useEffect(() => {
    const target = isActive
      ? document.querySelector(`[data-speech-index="${segmentIndex}"]`)
      : null;
    if (!target) return;

    target.setAttribute(SPEAKING_ATTRIBUTE, "");
    if (isOutsideViewport(target)) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    }
    return () => target.removeAttribute(SPEAKING_ATTRIBUTE);
  }, [segmentIndex, isActive]);
}

/**
 * Tombol "Dengarkan" + mini-player di bawah layar.
 * segments diurutkan sama dengan data-speech-index di halaman: judul, ringkasan, lalu paragraf.
 */
export function ListenToArticle({ segments }: { segments: string[] }) {
  const reader = useSpeechReader(segments);
  const isActive = reader.status !== "idle";
  const isPlaying = reader.status === "playing";

  useHighlightSegment(reader.segmentIndex, isActive);

  if (!reader.isSupported) return null;

  const toggle = isPlaying ? reader.pause : reader.play;
  const toggleLabel = isPlaying ? "Jeda" : reader.status === "paused" ? "Lanjutkan" : "Dengarkan";

  return (
    <>
      <button
        type="button"
        className={styles.listenButton}
        onClick={toggle}
        aria-pressed={isPlaying}
      >
        <span className={styles.listenIcon} aria-hidden="true" data-playing={isPlaying ? "" : undefined}>
          <span />
          <span />
          <span />
        </span>
        {toggleLabel}
      </button>

      {isActive && (
        <div className={styles.player} role="region" aria-label="Pemutar suara berita">
          <div className={styles.playerProgress} aria-hidden="true">
            <span style={{ transform: `scaleX(${reader.progress})` }} />
          </div>
          <div className={styles.playerInner}>
            <div className={styles.playerInfo}>
              <strong>{isPlaying ? "Sedang dibacakan" : "Dijeda"}</strong>
              <span aria-live="polite">
                {Math.round(reader.progress * 100)}% selesai
              </span>
              {reader.lacksIndonesianVoice && (
                <span className={styles.playerNote}>
                  Suara Bahasa Indonesia belum tersedia di perangkat ini, jadi logatnya bisa terdengar asing.
                </span>
              )}
            </div>
            <div className={styles.playerControls}>
              <button type="button" className={styles.playerMain} onClick={toggle}>
                {isPlaying ? "Jeda" : "Lanjutkan"}
              </button>
              <button
                type="button"
                className={styles.playerSecondary}
                onClick={reader.cycleRate}
                aria-label={`Kecepatan ${reader.rate} kali, ketuk untuk mengganti`}
              >
                {reader.rate}x
              </button>
              <button type="button" className={styles.playerSecondary} onClick={reader.stop}>
                Berhenti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}