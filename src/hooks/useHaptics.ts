import { useCallback } from "react";

export type PadraoHaptics =
  | "tap" // toque simples
  | "selecionado" // seleção / botão
  | "sucesso" // ação concluída
  | "favorito" // favoritar
  | "desfavoritar" // remover dos favoritos
  | "erro" // ação inválida
  | "swipe-curto" // swipe pequeno / borda
  | "swice-longo" // swipe grande / commit
  | "conquista" // desbloqueio de conquista
  | "ribble" // ondulação ripple
  | "conclusao" // 100% de um tema
  | "page-turn"; // som/pulse de virar página

const PADROES: Record<PadraoHaptics, number | number[]> = {
  tap: 8,
  selecionado: 12,
  sucesso: [10, 40, 10],
  favorito: [12, 20, 18],
  desfavoritar: [18, 20, 8],
  erro: [20, 30, 20, 30, 20],
  "swipe-curto": 6,
  "swice-longo": [10, 15, 25],
  conquista: [25, 30, 15, 30, 50],
  ribble: 10,
  conclusao: [40, 60, 30, 60, 40, 60, 80],
  "page-turn": 4,
};

export function useHaptics() {
  const disponivel =
    typeof navigator !== "undefined" && "vibrate" in navigator;

  const vibrar = useCallback(
    (padrao: PadraoHaptics) => {
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
