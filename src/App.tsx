import { useCallback, useMemo, useState } from "react";
import { TelaTemas } from "./components/TelaTemas";
import { TelaCuriosidade } from "./components/TelaCuriosidade";
import { TelaFavoritos } from "./components/TelaFavoritos";
import { useCuriosidades } from "./hooks/useCuriosidades";
import { useProgresso } from "./hooks/useProgresso";
import type { Curiosidade } from "./lib/tipos";

type Tela =
  | { nome: "temas" }
  | { nome: "tema"; temaId: string }
  | { nome: "favoritos"; voltarPara: "temas" | "tema"; temaId?: string };

export default function App() {
  const { temas, temaPorId, doTema, curiosidadePorId, sorteiaNaoVista } =
    useCuriosidades();
  const {
    progresso: _progresso,
    getTema,
    registrarVista,
    registrarJaSabia,
    alternarFavorito,
    ehFavorito,
  } = useProgresso();

  const [tela, setTela] = useState<Tela>({ nome: "temas" });
  const [atualId, setAtualId] = useState<string | null>(null);

  const mapaTemas = useMemo(() => {
    const m = new Map<string, (typeof temas)[number]>();
    for (const t of temas) m.set(t.id, t);
    return m;
  }, [temas]);

  const contagemPorTema = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of temas) m[t.id] = doTema(t.id).length;
    return m;
  }, [temas, doTema]);

  const vistasPorTema = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of temas) m[t.id] = getTema(t.id).vistas.length;
    return m;
  }, [temas, getTema]);

  const favoritosPorTema = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of temas) m[t.id] = getTema(t.id).favoritos.length;
    return m;
  }, [temas, getTema]);

  const abrirTema = useCallback(
    (temaId: string) => {
      const progTema = getTema(temaId);
      const proxima = sorteiaNaoVista(temaId, progTema.vistas);
      setAtualId(proxima?.id ?? null);
      setTela({ nome: "tema", temaId });
    },
    [getTema, sorteiaNaoVista],
  );

  const proxima = useCallback(() => {
    if (tela.nome !== "tema") return;
    const progTema = getTema(tela.temaId);
    const atual = atualId ? curiosidadePorId(atualId) : undefined;
    const ignorar = atual?.id;
    const nova = sorteiaNaoVista(tela.temaId, progTema.vistas, ignorar);
    if (!nova) return;
    registrarVista(tela.temaId, nova.id);
    setAtualId(nova.id);
  }, [tela, atualId, getTema, sorteiaNaoVista, curiosidadePorId, registrarVista]);

  const jaSabia = useCallback(() => {
    if (tela.nome !== "tema" || !atualId) return;
    registrarJaSabia(tela.temaId, atualId);
    const progTema = getTema(tela.temaId);
    const nova = sorteiaNaoVista(tela.temaId, progTema.vistas, atualId);
    setAtualId(nova?.id ?? null);
  }, [tela, atualId, getTema, sorteiaNaoVista, registrarJaSabia]);

  const favoritar = useCallback(() => {
    if (tela.nome !== "tema" || !atualId) return;
    alternarFavorito(tela.temaId, atualId);
  }, [tela, atualId, alternarFavorito]);

  const voltar = useCallback(() => {
    if (tela.nome === "tema") setTela({ nome: "temas" });
    else if (tela.nome === "favoritos") {
      if (tela.voltarPara === "tema" && tela.temaId) abrirTema(tela.temaId);
      else setTela({ nome: "temas" });
    }
  }, [tela, abrirTema]);

  const abrirFavoritos = useCallback(
    (de: "temas" | "tema", temaId?: string) => {
      setTela({ nome: "favoritos", voltarPara: de, temaId });
    },
    [],
  );

  if (tela.nome === "temas") {
    return (
      <TelaTemas
        temas={temas}
        contagemPorTema={contagemPorTema}
        vistasPorTema={vistasPorTema}
        favoritosPorTema={favoritosPorTema}
        onAbrirTema={abrirTema}
        onAbrirFavoritos={() => abrirFavoritos("temas")}
      />
    );
  }

  if (tela.nome === "tema") {
    const tema = temaPorId(tela.temaId);
    if (!tema) {
      setTela({ nome: "temas" });
      return null;
    }
    const progTema = getTema(tela.temaId);
    const curiosidadeAtual: Curiosidade | null = atualId
      ? (curiosidadePorId(atualId) ?? null)
      : null;
    const total = contagemPorTema[tela.temaId] ?? 0;
    const naoVistasRestantes =
      total - progTema.vistas.filter((id) => !progTema.jaSabia.includes(id)).length;
    return (
      <TelaCuriosidade
        tema={tema}
        atual={curiosidadeAtual}
        total={total}
        indiceVista={progTema.vistas.length}
        ehFavorito={atualId ? ehFavorito(tela.temaId, atualId) : false}
        esgotouNaoVistas={naoVistasRestantes <= 0}
        onVoltar={voltar}
        onProxima={proxima}
        onJaSabia={jaSabia}
        onFavoritar={favoritar}
      />
    );
  }

  // tela.nome === "favoritos"
  const idsFavoritos: string[] = [];
  for (const t of temas) {
    for (const id of getTema(t.id).favoritos) idsFavoritos.push(id);
  }
  const favoritos = idsFavoritos
    .map((id) => curiosidadePorId(id))
    .filter((c): c is Curiosidade => Boolean(c));

  const aoRemover = (c: Curiosidade) => alternarFavorito(c.temaId, c.id);

  return (
    <TelaFavoritos
      favoritos={favoritos}
      temas={mapaTemas}
      onVoltar={voltar}
      onAbrirTema={(temaId) => abrirTema(temaId)}
      onRemoverFavorito={aoRemover}
    />
  );
}
