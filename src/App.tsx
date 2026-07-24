import { useCallback, useEffect, useMemo, useState } from "react";
import { TelaTemas } from "./components/TelaTemas";
import { TelaCuriosidade } from "./components/TelaCuriosidade";
import { TelaFavoritos } from "./components/TelaFavoritos";
import { TelaHistorico } from "./components/TelaHistorico";
import { useCuriosidades } from "./hooks/useCuriosidades";
import { useProgresso } from "./hooks/useProgresso";
import { useStreak } from "./lib/streak";
import { useCuriosidadeDoDia } from "./lib/curiosidadeDoDia";
import { useSaudacao } from "./hooks/useSaudacao";
import { useXP, carregarXP } from "./hooks/useXP";
import { useServiceWorker } from "./hooks/useServiceWorker";
import { useDeepLink } from "./hooks/useDeepLink";
import { celebrar } from "./lib/celebration";
import type { Curiosidade } from "./lib/tipos";

type Tela =
  | { nome: "temas" }
  | { nome: "tema"; temaId: string }
  | { nome: "favoritos"; voltarPara: "temas" | "tema"; temaId?: string }
  | { nome: "historico" };

function percentual(vistas: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((vistas / total) * 100);
}

export default function App() {
  useServiceWorker();
  const deepLink = useDeepLink();

  const { temas, temaPorId, doTema, curiosidadePorId, sorteiaNaoVista } =
    useCuriosidades();
  const {
    progresso,
    getTema,
    registrarVista,
    registrarJaSabia,
    alternarFavorito,
    ehFavorito,
    timestamps,
  } = useProgresso();
  const streak = useStreak();
  const curiosidadeDoDia = useCuriosidadeDoDia();
  const saudacao = useSaudacao();

  const [tela, setTela] = useState<Tela>({ nome: "temas" });
  const [atualId, setAtualId] = useState<string | null>(null);
  const [xp, setXp] = useState<number>(() => carregarXP());
  const [mapaImagens, setMapaImagens] = useState<Record<string, string>>({});

  // Carrega imagens curadas em background (se existir)
  useEffect(() => {
    fetch("/curiosidades-imagens.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d === "object") setMapaImagens(d as Record<string, string>);
      })
      .catch(() => {
        // silencioso: imagens são opcionais
      });
  }, []);

  // Listener de XP via evento do useProgresso
  useEffect(() => {
    const handler = () => setXp(carregarXP());
    window.addEventListener("curioso:xp:evento", handler);
    return () => window.removeEventListener("curioso:xp:evento", handler);
  }, []);

  const nivelInfo = useXP(xp);

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
  }, [temas, getTema, progresso]);

  const favoritosPorTema = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of temas) m[t.id] = getTema(t.id).favoritos.length;
    return m;
  }, [temas, getTema, progresso]);

  const totalVistas = useMemo(
    () => Object.values(vistasPorTema).reduce((s, n) => s + n, 0),
    [vistasPorTema],
  );
  const totalCuriosidades = useMemo(
    () => Object.values(contagemPorTema).reduce((s, n) => s + n, 0),
    [contagemPorTema],
  );

  useEffect(() => {
    for (const t of temas) {
      const total = contagemPorTema[t.id] ?? 0;
      const vistas = vistasPorTema[t.id] ?? 0;
      const p = percentual(vistas, total);
      if (total === 0) continue;
      for (const marco of [25, 50, 100] as const) {
        if (p >= marco) celebrar(t.id, marco, t.cor);
      }
    }
  }, [temas, contagemPorTema, vistasPorTema]);

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
  }, [
    tela,
    atualId,
    getTema,
    sorteiaNaoVista,
    curiosidadePorId,
    registrarVista,
  ]);

  // Pull-to-refresh: pega uma curiosidade aleatória (de qualquer tema),
  // abre o tema dela e fixa o id. Haptics e som ficam no App.tsx via
  // callback não. Como o ptr é local na TelaCuriosidade, ela própria
  // chama onAleatoria que apenas sorteia e troca o id.
  const aleatoria = useCallback(() => {
    if (tela.nome !== "tema") return;
    const todasCuriosidades: Curiosidade[] = [];
    for (const t of temas) {
      for (const c of doTema(t.id)) {
        if (!todasCuriosidades.find((x) => x.id === c.id)) {
          todasCuriosidades.push(c);
        }
      }
    }
    if (todasCuriosidades.length === 0) return;
    // só não vistas deste tema
    const progTema = getTema(tela.temaId);
    const naoVistas = todasCuriosidades.filter(
      (c) => c.temaId === tela.temaId && !progTema.vistas.includes(c.id),
    );
    const candidatas = naoVistas.length > 0 ? naoVistas : todasCuriosidades.filter((c) => c.temaId === tela.temaId);
    if (candidatas.length === 0) return;
    const escolha = candidatas[Math.floor(Math.random() * candidatas.length)];
    if (!escolha) return;
    registrarVista(tela.temaId, escolha.id);
    setAtualId(escolha.id);
  }, [tela, temas, doTema, getTema, registrarVista]);

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
    } else if (tela.nome === "historico") {
      setTela({ nome: "temas" });
    }
  }, [tela, abrirTema]);

  const historico = useMemo(() => {
    const arr: { c: Curiosidade; dataIso: string }[] = [];
    for (const [k, iso] of Object.entries(timestamps)) {
      const [temaId, id] = k.split("::");
      if (!temaId || !id) continue;
      const c = curiosidadePorId(id);
      if (c) arr.push({ c, dataIso: iso });
    }
    return arr.sort((a, b) => (a.dataIso < b.dataIso ? 1 : -1));
  }, [timestamps, curiosidadePorId]);

  const abrirFavoritos = useCallback(
    (de: "temas" | "tema", temaId?: string) => {
      setTela({ nome: "favoritos", voltarPara: de, temaId });
    },
    [],
  );

  const abrirCuriosidade = useCallback(
    (c: Curiosidade) => {
      setAtualId(c.id);
      setTela({ nome: "tema", temaId: c.temaId });
    },
    [],
  );

  // Deep links / shortcuts: processa a URL uma vez no mount
  useEffect(() => {
    if (!deepLink) return;
    if (deepLink.curiosidadeId && deepLink.temaId) {
      setAtualId(deepLink.curiosidadeId);
      setTela({ nome: "tema", temaId: deepLink.temaId });
    } else if (deepLink.temaId) {
      const progTema = getTema(deepLink.temaId);
      const prox = sorteiaNaoVista(deepLink.temaId, progTema.vistas);
      setAtualId(prox?.id ?? null);
      setTela({ nome: "tema", temaId: deepLink.temaId });
    } else if (deepLink.acao === "favoritos") {
      setTela({ nome: "favoritos", voltarPara: "temas" });
    } else if (deepLink.acao === "historico") {
      setTela({ nome: "historico" });
    } else if (deepLink.acao === "hoje" && curiosidadeDoDia) {
      setAtualId(curiosidadeDoDia.id);
      setTela({ nome: "tema", temaId: curiosidadeDoDia.temaId });
    } else if (deepLink.acao === "temas") {
      setTela({ nome: "temas" });
    }
    // limpa querystring para evitar repetir ao navegar
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (tela.nome === "temas") {
    return (
      <TelaTemas
        temas={temas}
        contagemPorTema={contagemPorTema}
        vistasPorTema={vistasPorTema}
        favoritosPorTema={favoritosPorTema}
        totalVistas={totalVistas}
        totalCuriosidades={totalCuriosidades}
        streakAtual={streak.atual}
        streakMelhor={streak.melhor}
        escudos={streak.escudos}
        escudoUsado={streak.escudoUsado}
        ganhouEscudo={streak.ganhouEscudo}
        xp={xp}
        nivel={nivelInfo.atual}
        proximoNivel={nivelInfo.proximo}
        pctNivel={nivelInfo.pct}
        saudacao={saudacao}
        curiosidadeDoDia={curiosidadeDoDia ?? null}
        temaDoDia={curiosidadeDoDia ? temaPorId(curiosidadeDoDia.temaId) ?? null : null}
        onAbrirTema={abrirTema}
        onAbrirFavoritos={() => abrirFavoritos("temas")}
        onAbrirHistorico={() => setTela({ nome: "historico" })}
        onAbrirCuriosidade={abrirCuriosidade}
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
      total -
      progTema.vistas.filter((id) => !progTema.jaSabia.includes(id)).length;
    const numeroAtual = progTema.vistas.indexOf(atualId ?? "") + 1;
    const imagemUrl = atualId ? mapaImagens[atualId] : undefined;
    return (
      <TelaCuriosidade
        tema={tema}
        atual={curiosidadeAtual}
        total={total}
        numeroAtual={numeroAtual > 0 ? numeroAtual : Math.min(progTema.vistas.length + 1, total)}
        indiceVista={progTema.vistas.length}
        ehFavorito={atualId ? ehFavorito(tela.temaId, atualId) : false}
        esgotouNaoVistas={naoVistasRestantes <= 0}
        imagemUrl={imagemUrl}
        onVoltar={voltar}
        onProxima={proxima}
        onJaSabia={jaSabia}
        onFavoritar={favoritar}
        onAleatoria={aleatoria}
      />
    );
  }

  // favoritos
  const idsFavoritos: string[] = [];
  for (const t of temas) {
    for (const id of getTema(t.id).favoritos) idsFavoritos.push(id);
  }
  const favoritos = idsFavoritos
    .map((id) => curiosidadePorId(id))
    .filter((c): c is Curiosidade => Boolean(c));

  const aoRemover = (c: Curiosidade) => alternarFavorito(c.temaId, c.id);

  if (tela.nome === "historico") {
    return (
      <TelaHistorico
        itens={historico}
        temas={mapaTemas}
        onVoltar={voltar}
        onAbrirTema={abrirTema}
        onRemoverFavorito={aoRemover}
      />
    );
  }

  return (
    <TelaFavoritos
      favoritos={favoritos}
      temas={mapaTemas}
      onVoltar={voltar}
      onAbrirTema={(temaId) => abrirTema(temaId)}
      onRemoverFavorito={aoRemover}
      onExplorarTemas={() => setTela({ nome: "temas" })}
    />
  );
}
