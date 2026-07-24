import { useEffect, useState, useCallback } from "react";
import { carregarXP, salvarXP, XP } from "./useXP";

interface UseProgressoXp {
  xp: number;
  adicionarVista: () => void;
  adicionarJaSabia: () => void;
  adicionarFavorita: () => void;
  removerFavorita: () => void;
}

const CHAVE_EVENTO = "curioso:xp:evento";

export function useProgressoXp(): UseProgressoXp {
  const [xp, setXp] = useState<number>(() => carregarXP());

  useEffect(() => {
    salvarXP(xp);
  }, [xp]);

  // ouve eventos de outras partes do app
  useEffect(() => {
    const handler = (e: Event) => {
      const detalhe = (e as CustomEvent<{ tipo: keyof typeof XP }>).detail;
      if (!detalhe) return;
      const valor = XP[detalhe.tipo];
      if (typeof valor === "number") {
        setXp((atual) => Math.max(0, atual + valor));
      }
    };
    window.addEventListener(CHAVE_EVENTO, handler as EventListener);
    return () =>
      window.removeEventListener(CHAVE_EVENTO, handler as EventListener);
  }, []);

  const emitir = useCallback((tipo: keyof typeof XP) => {
    window.dispatchEvent(new CustomEvent(CHAVE_EVENTO, { detail: { tipo } }));
  }, []);

  return {
    xp,
    adicionarVista: () => emitir("vista"),
    adicionarJaSabia: () => emitir("jaSabia"),
    adicionarFavorita: () => emitir("favorita"),
    removerFavorita: () => emitir("favoritaRemovida"),
  };
}
