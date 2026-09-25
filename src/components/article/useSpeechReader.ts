"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SPEECH_LANG,
  nextSpeechRate,
  pickIndonesianVoice,
  toSpeechChunks,
  type SpeechRate,
} from "@/lib/speech";

export type SpeechStatus = "idle" | "playing" | "paused";

/** Jeda kecil setelah cancel(); tanpa ini Chrome kadang mengabaikan ucapan berikutnya. */
const RESTART_DELAY_MS = 60;

/**
 * Membacakan daftar teks dengan suara browser (Web Speech API).
 * "Jeda" sengaja dibuat sebagai berhenti + ingat posisi, karena pause() bawaan
 * browser tidak konsisten di Android dan Safari.
 */
export function useSpeechReader(segments: string[]) {
  const chunks = useMemo(() => toSpeechChunks(segments), [segments]);
  const [isSupported, setIsSupported] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [chunkIndex, setChunkIndex] = useState(0);
  const [rate, setRate] = useState<SpeechRate>(1);
  // Setiap mulai/berhenti menaikkan sesi; event dari ucapan lama diabaikan.
  const sessionRef = useRef(0);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    setIsSupported(true);

    const loadVoices = () => {
      const voices = synth.getVoices();
      if (voices.length === 0) return;
      setVoice(pickIndonesianVoice(voices));
      setVoicesLoaded(true);
    };
    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);

    return () => {
      synth.removeEventListener("voiceschanged", loadVoices);
      sessionRef.current += 1;
      synth.cancel();
    };
  }, []);

  const speakFrom = useCallback(
    (startIndex: number, speechRate: SpeechRate) => {
      const synth = window.speechSynthesis;
      const session = ++sessionRef.current;
      synth.cancel();

      const speakChunk = (index: number) => {
        if (session !== sessionRef.current) return;
        if (index >= chunks.length) {
          setStatus("idle");
          setChunkIndex(0);
          return;
        }

        setChunkIndex(index);
        const utterance = new SpeechSynthesisUtterance(chunks[index].text);
        utterance.lang = SPEECH_LANG;
        utterance.rate = speechRate;
        if (voice) utterance.voice = voice;
        utterance.onend = () => speakChunk(index + 1);
        utterance.onerror = (event) => {
          const wasStoppedByUs = event.error === "interrupted" || event.error === "canceled";
          if (!wasStoppedByUs && session === sessionRef.current) setStatus("idle");
        };
        synth.speak(utterance);
      };

      setStatus("playing");
      setTimeout(() => speakChunk(startIndex), RESTART_DELAY_MS);
    },
    [chunks, voice],
  );

  const play = useCallback(() => {
    speakFrom(status === "paused" ? chunkIndex : 0, rate);
  }, [speakFrom, status, chunkIndex, rate]);

  const pause = useCallback(() => {
    sessionRef.current += 1;
    window.speechSynthesis.cancel();
    setStatus("paused");
  }, []);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    window.speechSynthesis.cancel();
    setStatus("idle");
    setChunkIndex(0);
  }, []);

  const cycleRate = useCallback(() => {
    const next = nextSpeechRate(rate);
    setRate(next);
    if (status === "playing") speakFrom(chunkIndex, next);
  }, [rate, status, chunkIndex, speakFrom]);

  return {
    isSupported,
    status,
    rate,
    play,
    pause,
    stop,
    cycleRate,
    /** Bagian artikel (judul, ringkasan, paragraf) yang sedang dibacakan. */
    segmentIndex: chunks[chunkIndex]?.segmentIndex ?? 0,
    progress: chunks.length > 0 ? chunkIndex / chunks.length : 0,
    /** true bila perangkat tidak punya suara Bahasa Indonesia sama sekali. */
    lacksIndonesianVoice: voicesLoaded && voice === null,
  };
}