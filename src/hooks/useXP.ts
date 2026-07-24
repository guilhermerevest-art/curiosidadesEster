import { useMemo } from "react";

const CHAVE = "curioso:xp:v1";

export interface Nivel {
  indice: number;
  titulo: string;
  xpMin: number;
  xpMax: number;
}

export const NIVEIS: Nivel[] = [
  { indice: 0, titulo: "Aprendiz", xpMin: 0, xpMax: 50 },
  { indice: 1, titulo: "Curioso", xpMin: 50, xpMax: 150 },
  { indice: 2, titulo: "Estudioso", xpMin: 150, xpMax: 300 },
  { indice: 3, titulo: "Sábio", xpMin: 300, xpMax: 550 },
  { indice: 4, titulo: "Mestre", xpMin: 550, xpMax: 900 },
  { indice: 5, titulo: "Lendário", xpMin: 900, xpMax: 1400 },
  { indice: 6, titulo: "Mitológico", xpMin: 1400, xpMax: Infinity },
];

// XP por ação
export const XP = {
  vista: 2,
  jaSabia: 1,
  favorita: 3,
  favoritaRemovida: -1,
  quiz: 5, // futuro
};

export function carregarXP(): number {
  if (typeof window === "undefined") return 0;
  try {
    const v = window.localStorage.getItem(CHAVE);
    if (!v) return 0;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function salvarXP(xp: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE, String(Math.max(0, xp)));
  } catch {
    // silencioso
  }
}

export function nivelPara(xp: number): { atual: Nivel; proximo: Nivel | null; pct: number } {
  let atual = NIVEIS[0]!;
  for (const n of NIVEIS) {
    if (xp >= n.xpMin) atual = n;
  }
  const proximo = NIVEIS.find((n) => n.xpMin > xp) ?? null;
  const pct = proximo
    ? Math.min(100, ((xp - atual.xpMin) / (proximo.xpMin - atual.xpMin)) * 100)
    : 100;
  return { atual, proximo, pct };
}

export function useXP(xp: number) {
  return useMemo(() => nivelPara(xp), [xp]);
}
