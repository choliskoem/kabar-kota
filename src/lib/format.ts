import { siteConfig } from "@/lib/site";

const dateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: siteConfig.timeZone,
});

const timeFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: siteConfig.timeZone,
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return `${timeFormatter.format(new Date(iso))} WIB`;
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: siteConfig.timeZone });
const shortDateFormatter = new Intl.DateTimeFormat(siteConfig.locale, {
  day: "numeric",
  month: "short",
  timeZone: siteConfig.timeZone,
});

/** Jam untuk berita hari ini, tanggal singkat untuk berita yang lebih lama. */
export function formatStamp(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const isToday = dayKeyFormatter.format(date) === dayKeyFormatter.format(now);
  return isToday ? formatTime(iso) : shortDateFormatter.format(date);
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} mnt baca`;
}

/** "Anak Muda" → "#AnakMuda" */
export function toHashtag(name: string): string {
  return `#${name
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")}`;
}
