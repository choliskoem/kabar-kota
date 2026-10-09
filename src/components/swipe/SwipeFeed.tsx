"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/site";
import type { SwipeCard } from "@/lib/swipe";
import { ShareButton } from "@/components/article/ShareButton";
import { routeStyle } from "@/components/news/route-style";
import styles from "./swipe.module.css";

/** Petunjuk "geser ke atas" hanya ditampilkan sampai pengunjung pernah menggeser sekali. */
const HINT_STORAGE_KEY = "kk-swipe-hint-seen";
/** Kartu dianggap aktif bila sebagian besar tampil di layar. */
const ACTIVE_THRESHOLD = 0.6;

function hasSeenHint(): boolean {
  try {
    return localStorage.getItem(HINT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberHintSeen() {
  try {
    localStorage.setItem(HINT_STORAGE_KEY, "1");
  } catch {
    // Penyimpanan ditolak (mode privat); petunjuk muncul lagi di kunjungan berikutnya.
  }
}

export function SwipeFeed({ cards }: { cards: SwipeCard[] }) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const total = cards.length;

  useEffect(() => {
    setShowHint(!hasSeenHint());
    feedRef.current?.focus({ preventScroll: true });
  }, []);

  // Pantau kartu yang sedang tampil untuk penghitung "3 / 30".
  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          setActiveIndex(index);
          if (index > 0) {
            setShowHint(false);
            rememberHintSeen();
          }
        }
      },
      { root: feed, threshold: ACTIVE_THRESHOLD },
    );
    feed.querySelectorAll("[data-index]").forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const scrollToCard = useCallback((index: number) => {
    const target = feedRef.current?.querySelector(`[data-index="${index}"]`);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, []);

  // Keyboard: panah bawah/atas, PageDown/PageUp, atau j/k untuk pindah kartu.
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const nextKeys = ["ArrowDown", "PageDown", "j"];
    const previousKeys = ["ArrowUp", "PageUp", "k"];
    if (nextKeys.includes(event.key)) {
      event.preventDefault();
      scrollToCard(Math.min(activeIndex + 1, total));
    } else if (previousKeys.includes(event.key)) {
      event.preventDefault();
      scrollToCard(Math.max(activeIndex - 1, 0));
    }
  }

  if (total === 0) {
    return (
      <main className={styles.empty}>
        <p>Belum ada berita untuk di-swipe.</p>
        <Link href="/">Kembali ke beranda</Link>
      </main>
    );
  }

  return (
    <main className={styles.screen}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          {siteConfig.name}
        </Link>
        <span className={styles.counter} aria-live="polite">
          {Math.min(activeIndex + 1, total)} / {total}
        </span>
        <Link href="/" className={styles.close}>
          Tutup
        </Link>
      </header>

      <div
        ref={feedRef}
        className={styles.feed}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        aria-label="Berita, geser ke atas untuk berita berikutnya"
      >
        {cards.map((card, index) => (
          <article
            key={card.id}
            className={styles.card}
            data-index={index}
            style={routeStyle(card.category.color)}
            aria-label={`${index + 1} dari ${total}: ${card.title}`}
          >
            {card.imageSrc ? (
              <Image
                src={card.imageSrc}
                alt={card.imageAlt}
                fill
                sizes="(max-width: 600px) 100vw, 480px"
                className={styles.image}
                priority={index === 0}
              />
            ) : (
              <div className={styles.imageFallback} aria-hidden="true" />
            )}
            <div className={styles.shade} aria-hidden="true" />

            <div className={styles.content}>
              <p className={styles.meta}>
                <span className={styles.sticker}>{card.category.name}</span>
                {card.timeLabel && <span>{card.timeLabel}</span>}
              </p>
              <h2 className={styles.title}>{card.title}</h2>
              {card.highlights.length > 0 ? (
                <ul className={styles.highlights} aria-label="Intinya">
                  {card.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              ) : (
                <p className={styles.excerpt}>{card.excerpt}</p>
              )}
              <div className={styles.actions}>
                <Link href={`/berita/${card.slug}`} className={styles.readLink}>
                  Baca selengkapnya
                  <span aria-hidden="true">→</span>
                </Link>
                <ShareButton title={card.title} path={`/berita/${card.slug}`} />
              </div>
            </div>

            {index === 0 && showHint && (
              <p className={styles.hint} aria-hidden="true">
                <span className={styles.hintArrow}>↑</span>
                Geser ke atas
              </p>
            )}
          </article>
        ))}

        <section className={`${styles.card} ${styles.endCard}`} data-index={total} aria-label="Akhir daftar">
          <p className={styles.endEmoji} aria-hidden="true">
            🎉
          </p>
          <h2 className={styles.endTitle}>Kamu sudah lihat {total} berita terbaru</h2>
          <p>Balik lagi nanti, berita baru terus masuk.</p>
          <div className={styles.actions}>
            <button type="button" className={styles.readLink} onClick={() => scrollToCard(0)}>
              Ulangi dari awal
            </button>
            <Link href="/" className={styles.secondaryLink}>
              Ke beranda
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}