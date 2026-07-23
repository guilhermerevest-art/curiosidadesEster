import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Heart, Sparkles } from "lucide-react";
import type { Curiosidade, Tema } from "../lib/tipos";

interface TelaCuriosidadeProps {
  tema: Tema;
  atual: Curiosidade | null;
  total: number;
  indiceVista: number; // quantidade de vistas neste tema
  ehFavorito: boolean;
  esgotouNaoVistas: boolean;
  onVoltar: () => void;
  onProxima: () => void;
  onJaSabia: () => void;
  onFavoritar: () => void;
}

const ROTULO_NIVEL: Record<Curiosidade["nivel"], string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

const CLASSE_NIVEL: Record<Curiosidade["nivel"], string> = {
  facil: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  medio: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  dificil: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export function TelaCuriosidade({
  tema,
  atual,
  total,
  indiceVista,
  ehFavorito,
  esgotouNaoVistas,
  onVoltar,
  onProxima,
  onJaSabia,
  onFavoritar,
}: TelaCuriosidadeProps) {
  const toqueInicioX = useRef<number | null>(null);
  const [animando, setAnimando] = useState<"entrando" | "saindo">("entrando");

  useEffect(() => {
    setAnimando("entrando");
  }, [atual?.id]);

  const etiquetaProgresso = useMemo(() => {
    const vistas = Math.min(indiceVista, total);
    return `${vistas}/${total}`;
  }, [indiceVista, total]);

  function iniciarToque(e: React.TouchEvent) {
    toqueInicioX.current = e.touches[0]?.clientX ?? null;
  }

  function terminarToque(e: React.TouchEvent) {
    if (toqueInicioX.current === null) return;
    const fim = e.changedTouches[0]?.clientX ?? 0;
    const delta = fim - toqueInicioX.current;
    toqueInicioX.current = null;
    if (Math.abs(delta) < 60) return;
    if (delta < 0) onProxima();
  }

  function animarEProxima() {
    setAnimando("saindo");
    window.setTimeout(onProxima, 180);
  }

  function animarEJaSabia() {
    setAnimando("saindo");
    window.setTimeout(onJaSabia, 180);
  }

  return (
    <div className="min-h-full flex flex-col">
      <header
        className="sticky top-0 z-10 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/80"
        style={{
          borderBottomColor: `${tema.cor}55`,
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onVoltar}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-300 hover:bg-slate-800"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                {tema.emoji}
              </span>
              <h2 className="font-semibold text-slate-100 truncate">
                {tema.nome}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Progresso {etiquetaProgresso}
            </p>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums"
            style={{
              backgroundColor: `${tema.cor}26`,
              color: tema.cor,
            }}
          >
            {etiquetaProgresso}
          </span>
        </div>
        <div className="h-1 w-full bg-slate-900">
          <div
            className="h-full transition-[width] duration-500 ease-out"
            style={{
              width: `${Math.min(100, (indiceVista / Math.max(total, 1)) * 100)}%`,
              backgroundColor: tema.cor,
            }}
          />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-5">
        {atual ? (
          <article
            key={atual.id}
            onTouchStart={iniciarToque}
            onTouchEnd={terminarToque}
            className={[
              "relative w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-xl",
              "transition-all duration-200 ease-out",
              animando === "entrando"
                ? "animate-slide-up opacity-100"
                : "opacity-0 -translate-y-3",
            ].join(" ")}
            style={{
              backgroundColor: `${tema.cor}1A`,
              borderColor: `${tema.cor}55`,
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium border ${CLASSE_NIVEL[atual.nivel]}`}
              >
                {ROTULO_NIVEL[atual.nivel]}
              </span>
              <button
                type="button"
                onClick={onFavoritar}
                className={[
                  "flex items-center justify-center w-9 h-9 rounded-full border transition-colors",
                  ehFavorito
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                    : "border-slate-700 text-slate-300 hover:border-slate-500",
                ].join(" ")}
                aria-label={ehFavorito ? "Remover dos favoritos" : "Favoritar"}
                aria-pressed={ehFavorito}
              >
                <Heart
                  className="w-4 h-4"
                  fill={ehFavorito ? "currentColor" : "none"}
                />
              </button>
            </div>
            <p className="text-lg sm:text-xl leading-relaxed text-slate-50 font-medium">
              {atual.texto}
            </p>
            <div className="mt-6 pt-5 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Deslize para a esquerda ou use os botões</span>
            </div>
          </article>
        ) : (
          <div className="text-center text-slate-400">
            <p>Carregando…</p>
          </div>
        )}
      </div>

      <footer className="sticky bottom-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-4">
        <div className="max-w-md mx-auto flex items-stretch gap-3">
          <button
            type="button"
            onClick={animarEJaSabia}
            disabled={!atual}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl border border-slate-700 bg-slate-900 text-slate-200 font-medium hover:bg-slate-800 active:scale-[0.98] transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Já sabia
          </button>
          <button
            type="button"
            onClick={animarEProxima}
            disabled={!atual}
            className="flex-[1.5] flex items-center justify-center gap-2 h-12 rounded-2xl font-semibold text-white active:scale-[0.98] transition"
            style={{ backgroundColor: tema.cor }}
          >
            Próxima
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {esgotouNaoVistas && total > 0 && (
          <p className="mt-3 text-center text-xs text-slate-400">
            Você já viu todas as {total} curiosidades deste tema. Vamos
            repassá-las!
          </p>
        )}
      </footer>
    </div>
  );
}
