"use client";

import { useEffect, useRef } from "react";
import styles from "./article.module.css";

/** Bar tipis di atas layar yang terisi sesuai seberapa jauh berita sudah dibaca. */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      barRef.current?.style.setProperty("transform", `scaleX(${progress})`);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className={styles.progress} aria-hidden="true">
      <div ref={barRef} className={styles.progressBar} />
    </div>
  );
}
