import { useCallback, useEffect, useRef, useState } from "react";

interface UseTTS {
  disponivel: boolean;
  falando: boolean;
  pausado: boolean;
  carregar: (texto: string) => void;
  play: () => void;
  pause: () => void;
  parar: () => void;
}

export function useTTS(): UseTTS {
  const [falando, setFalando] = useState(false);
  const [pausado, setPausado] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textoRef = useRef<string>("");

  const disponivel =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const parar = useCallback(() => {
    if (!disponivel) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // silencioso
    }
    setFalando(false);
    setPausado(false);
  }, [disponivel]);

  const carregar = useCallback(
    (texto: string) => {
      if (!disponivel) return;
      textoRef.current = texto;
      parar();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "pt-BR";
      u.rate = 1;
      u.pitch = 1;
      u.onend = () => {
        setFalando(false);
        setPausado(false);
      };
      u.onerror = () => {
        setFalando(false);
        setPausado(false);
      };
      utteranceRef.current = u;
    },
    [disponivel, parar],
  );

  const play = useCallback(() => {
    if (!disponivel) return;
    if (pausado) {
      window.speechSynthesis.resume();
      setPausado(false);
      setFalando(true);
      return;
    }
    if (utteranceRef.current) {
      try {
        window.speechSynthesis.speak(utteranceRef.current);
        setFalando(true);
      } catch {
        // silencioso
      }
    } else if (textoRef.current) {
      carregar(textoRef.current);
      setTimeout(play, 0);
    }
  }, [disponivel, pausado, carregar]);

  const pause = useCallback(() => {
    if (!disponivel) return;
    try {
      window.speechSynthesis.pause();
      setPausado(true);
    } catch {
      // silencioso
    }
  }, [disponivel]);

  // cleanup
  useEffect(() => {
    return () => {
      if (disponivel) window.speechSynthesis.cancel();
    };
  }, [disponivel]);

  return { disponivel, falando, pausado, carregar, play, pause, parar };
}
