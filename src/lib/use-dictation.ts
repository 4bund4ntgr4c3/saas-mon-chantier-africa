import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Dictée vocale (Web Speech API) — pattern factorisé depuis l'assistant.
 * Chrome/Edge : `webkitSpeechRecognition`, Safari : `SpeechRecognition`.
 * Navigateurs sans support → `supported: false` (repli saisie clavier).
 */

export type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as Record<string, unknown>;
  const ctor = (win["SpeechRecognition"] ?? win["webkitSpeechRecognition"]) as
    (new () => SpeechRecognitionLike) | undefined;
  return ctor ?? null;
}

export function isDictationSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export function useDictation({
  lang = "fr-FR",
  onTranscript,
}: {
  lang?: string;
  onTranscript: (transcript: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [supported] = useState(() => isDictationSupported());
  const transcriptRef = useRef(onTranscript);

  useEffect(() => {
    transcriptRef.current = onTranscript;
  }, [onTranscript]);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    setListening(false);
    try {
      rec?.stop();
    } catch {
      // déjà arrêtée
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    stop();
    try {
      const rec = new Ctor();
      rec.lang = lang;
      rec.interimResults = false;
      rec.continuous = false;
      rec.onresult = (e) => {
        const transcript = e.results[0]?.[0]?.transcript ?? "";
        if (transcript) transcriptRef.current(transcript.trim());
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recognitionRef.current = rec;
      setListening(true);
      rec.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
    }
  }, [lang, stop]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  useEffect(() => stop, [stop]);

  return { supported, listening, start, stop, toggle };
}
