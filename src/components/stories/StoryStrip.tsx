"use client";

import { useState } from "react";
import type { StoryGroup } from "@/lib/stories";
import { routeStyle } from "@/components/news/route-style";
import { StoryViewer } from "./StoryViewer";
import { useSeenStories } from "./useSeenStories";
import styles from "./stories.module.css";

interface OpenState {
  groupIndex: number;
  storyIndex: number;
}

/** Deretan lingkaran ala Instagram, satu per kategori. Lingkaran abu-abu = sudah dilihat semua. */
export function StoryStrip({ groups }: { groups: StoryGroup[] }) {
  const [open, setOpen] = useState<OpenState | null>(null);
  const { isSeen, markSeen } = useSeenStories();

  if (groups.length === 0) return null;

  function openGroup(groupIndex: number) {
    const firstUnseen = groups[groupIndex].stories.findIndex((story) => !isSeen(story.id));
    setOpen({ groupIndex, storyIndex: Math.max(0, firstUnseen) });
  }

  return (
    <>
      <nav className={styles.strip} aria-label="Stories berita per kategori" data-lenis-prevent>
        <ul className={styles.circles}>
          {groups.map((group, groupIndex) => {
            const allSeen = group.stories.every((story) => isSeen(story.id));
            const cover = group.stories.find((story) => !isSeen(story.id)) ?? group.stories[0];
            return (
              <li key={group.category.id} style={routeStyle(group.category.color)}>
                <button
                  type="button"
                  className={styles.circle}
                  data-seen={allSeen ? "" : undefined}
                  onClick={() => openGroup(groupIndex)}
                  aria-label={`Lihat stories ${group.category.name}, ${group.stories.length} berita${
                    allSeen ? ", sudah dilihat" : ""
                  }`}
                >
                  <span className={styles.ring}>
                    {cover.thumbSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover.thumbSrc} alt="" className={styles.ringImage} loading="lazy" />
                    ) : (
                      <span className={styles.ringFallback}>{group.category.name.charAt(0)}</span>
                    )}
                  </span>
                  <span className={styles.circleLabel}>{group.category.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {open && (
        <StoryViewer
          groups={groups}
          initialGroupIndex={open.groupIndex}
          initialStoryIndex={open.storyIndex}
          onSeen={markSeen}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}