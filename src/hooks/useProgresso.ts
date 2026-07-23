import { useCallback, useEffect, useState } from "react";
import {
  carregarProgresso,
  progressoVazio,
  salvarProgresso,
} from "../lib/storage";
import type { Progresso, ProgressoTema } from "../lib/tipos";

interface UseProgresso {
  progresso: Progresso;
  getTema: (temaId: string) => ProgressoTema;
  registrarVista: (temaId: string, curiosidadeId: string) => void;
  registrarJaSabia: (temaId: string, curiosidadeId: string) => void;
  alternarFavorito: (temaId: string, curiosidadeId: string) => void;
  ehFavorito: (temaId: string, curiosidadeId: string) => boolean;
  resetarTema: (temaId: string) => void;
}

export function useProgresso(): UseProgresso {
  const [progresso, setProgresso] = useState<Progresso>(() => carregarProgresso());

  useEffect(() => {
    salvarProgresso(progresso);
  }, [progresso]);

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
      atualizarTema(temaId, (t) =>
        t.vistas.includes(curiosidadeId)
          ? t
          : { ...t, vistas: [...t.vistas, curiosidadeId] },
      );
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
    },
    [atualizarTema],
  );

  const alternarFavorito = useCallback(
    (temaId: string, curiosidadeId: string) => {
      atualizarTema(temaId, (t) => ({
        ...t,
        favoritos: t.favoritos.includes(curiosidadeId)
          ? t.favoritos.filter((id) => id !== curiosidadeId)
          : [...t.favoritos, curiosidadeId],
      }));
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
  }, []);

  return {
    progresso,
    getTema,
    registrarVista,
    registrarJaSabia,
    alternarFavorito,
    ehFavorito,
    resetarTema,
  };
}
