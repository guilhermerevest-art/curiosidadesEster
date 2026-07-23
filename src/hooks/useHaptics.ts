import { useCallback } from "react";

type Padrao = "tap" | "sucesso" | "favorito" | "selecionado" | "erro";

const PADROES: Record<Padrao, number | number[]> = {
  tap: 8,
  selecionado: 12,
  sucesso: [10, 40, 10],
  favorito: [12, 20, 18],
  erro: [20, 30, 20, 30, 20],
};

export function useHaptics() {
  const disponivel =
    typeof navigator !== "undefined" && "vibrate" in navigator;

  const vibrar = useCallback(
    (padrao: Padrao) => {
      if (!disponivel) return;
      try {
        navigator.vibrate(PADROES[padrao]);
      } catch {
        // silencioso: alguns navegadores bloqueiam
      }
    },
    [disponivel],
  );

  return { disponivel, vibrar };
}
