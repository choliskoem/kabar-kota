"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

interface LeadRevealProps {
  className: string;
  style: CSSProperties;
  children: ReactNode;
}

/**
 * Satu-satunya animasi otomatis di beranda: blok judul poster naik,
 * lalu stiker kategori "ditempel". Dilewati bila pengguna memilih kurangi gerakan.
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
        .from(root.querySelectorAll('[data-reveal="slab"]'), {
          yPercent: 30,
          autoAlpha: 0,
          duration: 0.8,
          // Hapus transform setelah selesai agar tautan poster menutupi seluruh poster.
          clearProps: "transform",
        })
        .from(
          root.querySelectorAll('[data-reveal="sticker"]'),
          { scale: 0.4, rotate: -18, autoAlpha: 0, duration: 0.5, ease: "back.out(2.2)", clearProps: "transform" },
          "-=0.35",
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
