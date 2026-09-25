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

/** Formulir browser mengirim baris baru sebagai \r\n; disamakan menjadi \n. */
export function normalizeLineBreaks(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}

/** Setiap baris baru dianggap paragraf baru; baris kosong berlebih diabaikan. */
export function splitParagraphs(text: string): string[] {
  return normalizeLineBreaks(text)
    .split("\n")
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
const relativeFormatter = new Intl.RelativeTimeFormat(siteConfig.locale, { numeric: "auto" });

/** "baru saja", "5 menit yang lalu", "kemarin", atau tanggal bila lebih dari seminggu. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const absolute = Math.abs(seconds);

  if (absolute < 60) return "baru saja";
  if (absolute < 3600) return relativeFormatter.format(Math.round(seconds / 60), "minute");
  if (absolute < 86400) return relativeFormatter.format(Math.round(seconds / 3600), "hour");
  if (absolute < 7 * 86400) return relativeFormatter.format(Math.round(seconds / 86400), "day");
  return formatDate(iso);
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Sama dengan fungsi reading_minutes di database: 200 kata per menit, minimal 1. */
export function estimateReadingMinutes(text: string): number {
  return Math.max(1, Math.ceil(countWords(text) / 200));
}

const FRESH_WINDOW_MS = 60 * 60 * 1000;

/** Berita dianggap "baru" bila terbit kurang dari satu jam lalu. */
export function isFresh(iso: string, now: Date = new Date()): boolean {
  return now.getTime() - new Date(iso).getTime() < FRESH_WINDOW_MS;
}