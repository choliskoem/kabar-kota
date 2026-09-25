/** Potongan teks yang dibacakan satu per satu, beserta bagian artikel asalnya. */
export interface SpeechChunk {
  segmentIndex: number;
  text: string;
}

/**
 * Chrome kadang berhenti membaca bila satu ucapan terlalu panjang, jadi setiap
 * bagian dipecah per kalimat lalu digabung lagi hingga maksimal ~220 karakter.
 */
const MAX_CHUNK_LENGTH = 220;

function splitSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g)?.map((sentence) => sentence.trim()) ?? [];
}

export function toSpeechChunks(segments: string[]): SpeechChunk[] {
  return segments.flatMap((segment, segmentIndex) => {
    const chunks: SpeechChunk[] = [];
    let current = "";

    for (const sentence of splitSentences(segment)) {
      if (current && current.length + sentence.length + 1 > MAX_CHUNK_LENGTH) {
        chunks.push({ segmentIndex, text: current });
        current = sentence;
      } else {
        current = current ? `${current} ${sentence}` : sentence;
      }
    }
    if (current) chunks.push({ segmentIndex, text: current });
    return chunks;
  });
}

export const SPEECH_LANG = "id-ID";

export function pickIndonesianVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return (
    voices.find((voice) => voice.lang === SPEECH_LANG) ??
    voices.find((voice) => voice.lang.toLowerCase().replace("_", "-").startsWith("id")) ??
    null
  );
}

export const SPEECH_RATES = [1, 1.25, 1.5, 0.75] as const;
export type SpeechRate = (typeof SPEECH_RATES)[number];

export function nextSpeechRate(rate: SpeechRate): SpeechRate {
  const index = SPEECH_RATES.indexOf(rate);
  return SPEECH_RATES[(index + 1) % SPEECH_RATES.length];
}