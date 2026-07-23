import { useCallback, useMemo, useState } from "react";
import dadosBrutos from "../data/curiosidades.json";
import type { Curiosidade, Tema } from "../lib/tipos";

interface DataCarregada {
  temas: Tema[];
  curiosidades: Curiosidade[];
}

// Isolando a leitura do JSON num único ponto para facilitar
// a futura troca para Supabase (basta substituir este módulo).
function carregarDados(): DataCarregada {
  return dadosBrutos as unknown as DataCarregada;
}

const dados = carregarDados();

interface UseCuriosidades {
  temas: Tema[];
  temaPorId: (id: string) => Tema | undefined;
  doTema: (temaId: string) => Curiosidade[];
  curiosidadePorId: (id: string) => Curiosidade | undefined;
  sorteiaNaoVista: (
    temaId: string,
    vistas: string[],
    ignorar?: string,
  ) => Curiosidade | null;
}

export function useCuriosidades(): UseCuriosidades {
  const [dadosEstaticos] = useState(() => dados);

  const temas = useMemo(() => dadosEstaticos.temas, [dadosEstaticos]);

  const mapaTemas = useMemo(() => {
    const m = new Map<string, Tema>();
    for (const t of temas) m.set(t.id, t);
    return m;
  }, [temas]);

  const mapaPorId = useMemo(() => {
    const m = new Map<string, Curiosidade>();
    for (const c of dadosEstaticos.curiosidades) m.set(c.id, c);
    return m;
  }, [dadosEstaticos]);

  const porTema = useMemo(() => {
    const m = new Map<string, Curiosidade[]>();
    for (const c of dadosEstaticos.curiosidades) {
      const lista = m.get(c.temaId) ?? [];
      lista.push(c);
      m.set(c.temaId, lista);
    }
    return m;
  }, [dadosEstaticos]);

  const temaPorId = useCallback(
    (id: string) => mapaTemas.get(id),
    [mapaTemas],
  );

  const doTema = useCallback(
    (temaId: string) => porTema.get(temaId) ?? [],
    [porTema],
  );

  const curiosidadePorId = useCallback(
    (id: string) => mapaPorId.get(id),
    [mapaPorId],
  );

  const sorteiaNaoVista = useCallback(
    (temaId: string, vistas: string[], ignorar?: string) => {
      const todas = porTema.get(temaId) ?? [];
      const naoVistas = todas.filter(
        (c) => !vistas.includes(c.id) && c.id !== ignorar,
      );
      const candidatas = naoVistas.length > 0 ? naoVistas : todas;
      if (candidatas.length === 0) return null;
      const indice = Math.floor(Math.random() * candidatas.length);
      return candidatas[indice] ?? null;
    },
    [porTema],
  );

  return {
    temas,
    temaPorId,
    doTema,
    curiosidadePorId,
    sorteiaNaoVista,
  };
}
