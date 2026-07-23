import { useCallback, useEffect, useState } from "react";

export type NivelFonte = "P" | "M" | "G"; // Pequeno / Médio / Grande

const CHAVE = "curioso:tamanho-fonte:v1";

const VALORES: Record<NivelFonte, string> = {
  P: "14px",
  M: "16px",
  G: "18px",
};

const ORDEM: NivelFonte[] = ["P", "M", "G"];

function detectarInicial(): NivelFonte {
  if (typeof window === "undefined") return "M";
  try {
    const v = window.localStorage.getItem(CHAVE);
    if (v === "P" || v === "M" || v === "G") return v;
  } catch {
    // silencioso
  }
  return "M";
}

export function useTamanhoFonte() {
  const [nivel, setNivel] = useState<NivelFonte>(detectarInicial);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE, nivel);
    } catch {
      // silencioso
    }
    document.documentElement.style.fontSize = VALORES[nivel];
  }, [nivel]);

  const aumentar = useCallback(() => {
    setNivel((n) => {
      const i = ORDEM.indexOf(n);
      return ORDEM[Math.min(ORDEM.length - 1, i + 1)] ?? "G";
    });
  }, []);

  const diminuir = useCallback(() => {
    setNivel((n) => {
      const i = ORDEM.indexOf(n);
      return ORDEM[Math.max(0, i - 1)] ?? "P";
    });
  }, []);

  return { nivel, aumentar, diminuir, valor: VALORES[nivel] };
}
