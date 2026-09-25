"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

interface LeadRevealProps {
  className: string;
  style: CSSProperties;
  children: ReactNode;
}

/**
 * Satu-satunya animasi otomatis di halaman: garis jalur berita utama "ditarik",
 * lalu judul dan ringkasannya muncul. Dilewati bila pengguna memilih kurangi gerakan.
 */
export function LeadReveal({ className, style, children }: LeadRevealProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(root.querySelectorAll('[data-reveal="route"]'), {
          scaleY: 0,
          transformOrigin: "top center",
          duration: 0.9,
        })
        .from(
          root.querySelectorAll('[data-reveal="text"]'),
          { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.08 },
          "-=0.55",
        );
    });

    return () => media.revert();
  }, []);

  return (
    <article ref={rootRef} className={className} style={style}>
      {children}
    </article>
  );
}
