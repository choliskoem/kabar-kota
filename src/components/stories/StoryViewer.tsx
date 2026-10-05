"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { formatRelative } from "@/lib/format";
import type { StoryGroup } from "@/lib/stories";
import { routeStyle } from "@/components/news/route-style";
import styles from "./stories.module.css";

const STORY_DURATION_MS = 6000;
/** Sentuhan lebih lama dari ini dianggap "tahan untuk jeda", bukan ketukan. */
const HOLD_THRESHOLD_MS = 250;
/** Usapan ke bawah sejauh ini menutup story (seperti di Instagram). */
const SWIPE_CLOSE_PX = 90;

interface StoryViewerProps {
  groups: StoryGroup[];
  initialGroupIndex: number;
  initialStoryIndex: number;
  onSeen: (storyId: string) => void;
  onClose: () => void;
}

interface PointerStart {
  x: number;
  y: number;
  time: number;
}

export function StoryViewer({
  groups,
  initialGroupIndex,
  initialStoryIndex,
  onSeen,
  onClose,
}: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(initialStoryIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const pointerStart = useRef<PointerStart | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const group = groups[groupIndex];
  const story = group.stories[storyIndex];
  const nextStory =
    group.stories[storyIndex + 1] ?? groups[groupIndex + 1]?.stories[0] ?? null;

  const goNext = useCallback(() => {
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  }, [storyIndex, groupIndex, group.stories.length, groups.length, onClose]);

  const goPrevious = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
    } else if (groupIndex > 0) {
      const previousGroup = groups[groupIndex - 1];
      setGroupIndex(groupIndex - 1);
      setStoryIndex(previousGroup.stories.length - 1);
    }
  }, [storyIndex, groupIndex, groups]);

  // Tandai story sebagai sudah dilihat.
  useEffect(() => {
    onSeen(story.id);
  }, [story.id, onSeen]);

  // Kunci scroll halaman, fokus ke tombol tutup, lalu kembalikan fokus saat ditutup.
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      root.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  // Keyboard: Esc tutup, panah kiri/kanan pindah, spasi jeda.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") goNext();
      else if (event.key === "ArrowLeft") goPrevious();
      else if (event.key === " ") {
        event.preventDefault();
        setIsPaused((paused) => !paused);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrevious, onClose]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    pointerStart.current = { x: event.clientX, y: event.clientY, time: Date.now() };
    setIsHolding(true);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    setIsHolding(false);
    if (!start) return;

    if (event.clientY - start.y > SWIPE_CLOSE_PX) {
      onClose();
      return;
    }
    if (Date.now() - start.time > HOLD_THRESHOLD_MS) return;

    const { left, width } = event.currentTarget.getBoundingClientRect();
    if (event.clientX - left < width / 3) goPrevious();
    else goNext();
  }

  function handlePointerCancel() {
    pointerStart.current = null;
    setIsHolding(false);
  }

  const isRunning = !isPaused && !isHolding;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`Stories ${group.category.name}`}
      data-lenis-prevent
      onClick={(event) => {
        // Klik di latar gelap (di luar bingkai story) menutup penampil.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button type="button" className={styles.sideButton} onClick={goPrevious}>
        <span aria-hidden="true">‹</span>
        <span className={styles.visuallyHidden}>Story sebelumnya</span>
      </button>

      <div className={styles.frame} style={routeStyle(group.category.color)} key={groupIndex}>
        {story.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`image-${story.id}`} src={story.imageSrc} alt={story.imageAlt} className={styles.image} />
        ) : (
          <div key={`image-${story.id}`} className={styles.imageFallback} aria-hidden="true" />
        )}
        {nextStory?.imageSrc && (
          // Muat foto berikutnya lebih dulu supaya perpindahan tidak berkedip.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={nextStory.imageSrc} alt="" className={styles.preload} aria-hidden="true" />
        )}
        <div className={styles.shade} aria-hidden="true" />

        {/* Area ketuk: kiri = sebelumnya, kanan = berikutnya, tahan = jeda, usap bawah = tutup */}
        <div
          className={styles.tapZone}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerCancel}
          onContextMenu={(event) => event.preventDefault()}
        />

        <div className={styles.top}>
          <div className={styles.progress} aria-hidden="true">
            {group.stories.map((item, index) => (
              <span key={item.id} className={styles.progressTrack}>
                {index < storyIndex && <span className={styles.progressDone} />}
                {index === storyIndex && (
                  <span
                    key={`${groupIndex}-${storyIndex}`}
                    className={styles.progressFill}
                    style={
                      {
                        "--story-duration": `${STORY_DURATION_MS}ms`,
                        animationPlayState: isRunning ? "running" : "paused",
                      } as CSSProperties
                    }
                    onAnimationEnd={goNext}
                  />
                )}
              </span>
            ))}
          </div>

          <div className={styles.header}>
            <span className={styles.sticker}>{group.category.name}</span>
            {story.publishedAt && (
              <span className={styles.time}>{formatRelative(story.publishedAt)}</span>
            )}
            <span className={styles.controls}>
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setIsPaused((paused) => !paused)}
                aria-pressed={isPaused}
              >
                {isPaused ? "Putar" : "Jeda"}
              </button>
              <button ref={closeButtonRef} type="button" className={styles.iconButton} onClick={onClose}>
                Tutup
              </button>
            </span>
          </div>
        </div>

        <div className={styles.content} key={`content-${story.id}`}>
          <p className={styles.counter} aria-live="polite">
            {storyIndex + 1} dari {group.stories.length}
          </p>
          <h2 className={styles.title}>{story.title}</h2>
          <p className={styles.excerpt}>{story.excerpt}</p>
          <Link href={`/berita/${story.slug}`} className={styles.cta} onClick={onClose}>
            Baca berita
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <button type="button" className={styles.sideButton} onClick={goNext}>
        <span aria-hidden="true">›</span>
        <span className={styles.visuallyHidden}>Story berikutnya</span>
      </button>
    </div>
  );
}