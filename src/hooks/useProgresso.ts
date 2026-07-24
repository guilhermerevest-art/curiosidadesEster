import { useCallback, useEffect, useRef, useState } from "react";
import {
  carregarProgresso,
  progressoVazio,
  salvarProgresso,
} from "../lib/storage";
import type { Progresso, ProgressoTema } from "../lib/tipos";
import { carregarXP, salvarXP, XP } from "./useXP";

export const EVENTO_XP = "curioso:xp:evento";

function emitirXP(tipo: keyof typeof XP) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENTO_XP, { detail: { tipo } }));
}

function aplicarXP(valor: number) {
  if (typeof window === "undefined") return;
  const atual = carregarXP();
  const proximo = Math.max(0, atual + valor);
  salvarXP(proximo);
}

interface UseProgresso {
  progresso: Progresso;
  getTema: (temaId: string) => ProgressoTema;
  registrarVista: (temaId: string, curiosidadeId: string) => void;
  registrarJaSabia: (temaId: string, curiosidadeId: string) => void;
  alternarFavorito: (temaId: string, curiosidadeId: string) => void;
  ehFavorito: (temaId: string, curiosidadeId: string) => boolean;
  resetarTema: (temaId: string) => void;
  // mapa: temaId + curiosidadeId -> ISO timestamp da última vista
  timestamps: Record<string, string>;
}

export function useProgresso(): UseProgresso {
  const [progresso, setProgresso] = useState<Progresso>(() => carregarProgresso());
  const [timestamps, setTimestamps] = useState<Record<string, string>>(() => carregarTimestamps());
  const progressoRef = useRef(progresso);
  progressoRef.current = progresso;

  useEffect(() => {
    salvarProgresso(progresso);
  }, [progresso]);

  useEffect(() => {
    salvarTimestamps(timestamps);
  }, [timestamps]);

  const atualizarTema = useCallback(
    (temaId: string, atualizadora: (atual: ProgressoTema) => ProgressoTema) => {
      setProgresso((anterior) => {
        const atual = anterior[temaId] ?? progressoVazio();
        return { ...anterior, [temaId]: atualizadora(atual) };
      });
    },
    [],
  );

  const getTema = useCallback(
    (temaId: string): ProgressoTema => progresso[temaId] ?? progressoVazio(),
    [progresso],
  );

  const registrarVista = useCallback(
    (temaId: string, curiosidadeId: string) => {
      const tema = progressoRef.current[temaId];
      if (tema?.vistas.includes(curiosidadeId)) return;
      atualizarTema(temaId, (t) =>
        t.vistas.includes(curiosidadeId)
          ? t
          : { ...t, vistas: [...t.vistas, curiosidadeId] },
      );
      setTimestamps((ant) => ({
        ...ant,
        [`${temaId}::${curiosidadeId}`]: new Date().toISOString(),
      }));
      aplicarXP(XP.vista);
      emitirXP("vista");
    },
    [atualizarTema],
  );

  const registrarJaSabia = useCallback(
    (temaId: string, curiosidadeId: string) => {
      atualizarTema(temaId, (t) => ({
        ...t,
        jaSabia: t.jaSabia.includes(curiosidadeId)
          ? t.jaSabia
          : [...t.jaSabia, curiosidadeId],
        vistas: t.vistas.includes(curiosidadeId)
          ? t.vistas
          : [...t.vistas, curiosidadeId],
      }));
      setTimestamps((ant) => ({
        ...ant,
        [`${temaId}::${curiosidadeId}`]: new Date().toISOString(),
      }));
      aplicarXP(XP.jaSabia);
      emitirXP("jaSabia");
    },
    [atualizarTema],
  );

  const alternarFavorito = useCallback(
    (temaId: string, curiosidadeId: string) => {
      const tema = progressoRef.current[temaId];
      const ehFav = tema?.favoritos.includes(curiosidadeId) ?? false;
      atualizarTema(temaId, (t) => ({
        ...t,
        favoritos: t.favoritos.includes(curiosidadeId)
          ? t.favoritos.filter((id) => id !== curiosidadeId)
          : [...t.favoritos, curiosidadeId],
      }));
      if (ehFav) {
        aplicarXP(XP.favoritaRemovida);
        emitirXP("favoritaRemovida");
      } else {
        aplicarXP(XP.favorita);
        emitirXP("favorita");
      }
    },
    [atualizarTema],
  );

  const ehFavorito = useCallback(
    (temaId: string, curiosidadeId: string) =>
      (progresso[temaId]?.favoritos ?? []).includes(curiosidadeId),
    [progresso],
  );

  const resetarTema = useCallback((temaId: string) => {
    setProgresso((anterior) => {
      const proximo = { ...anterior };
      delete proximo[temaId];
      return proximo;
    });
    setTimestamps((ant) => {
      const proximo = { ...ant };
      for (const k of Object.keys(proximo)) {
        if (k.startsWith(`${temaId}::`)) delete proximo[k];
      }
      return proximo;
    });
  }, []);

  return {
    progresso,
    getTema,
    registrarVista,
    registrarJaSabia,
    alternarFavorito,
    ehFavorito,
    resetarTema,
    timestamps,
  };
}

const CHAVE_TS = "curioso:timestamps:v1";

function carregarTimestamps(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const bruto = window.localStorage.getItem(CHAVE_TS);
    if (!bruto) return {};
    const parsed = JSON.parse(bruto);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function salvarTimestamps(t: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE_TS, JSON.stringify(t));
  } catch {
    // silencioso
  }
}
