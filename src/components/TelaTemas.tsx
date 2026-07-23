import { ArrowRight, Flame, Heart, Sparkles, Sun } from "lucide-react";
import type { Curiosidade, Tema } from "../lib/tipos";
import { CartaoTema } from "./CartaoTema";

interface TelaTemasProps {
  temas: Tema[];
  contagemPorTema: Record<string, number>;
  vistasPorTema: Record<string, number>;
  favoritosPorTema: Record<string, number>;
  totalVistas: number;
  totalCuriosidades: number;
  streakAtual: number;
  streakMelhor: number;
  saudacao: { texto: string; icone: string };
  curiosidadeDoDia: Curiosidade | null;
  temaDoDia: Tema | null;
  onAbrirTema: (temaId: string) => void;
  onAbrirFavoritos: () => void;
  onAbrirCuriosidade: (curiosidade: Curiosidade) => void;
}

export function TelaTemas({
  temas,
  contagemPorTema,
  vistasPorTema,
  favoritosPorTema,
  totalVistas,
  totalCuriosidades,
  streakAtual,
  streakMelhor,
  saudacao,
  curiosidadeDoDia,
  temaDoDia,
  onAbrirTema,
  onAbrirFavoritos,
  onAbrirCuriosidade,
}: TelaTemasProps) {
  const totalFavoritos = Object.values(favoritosPorTema).reduce(
    (s, n) => s + n,
    0,
  );
  const percentualGeral = totalCuriosidades
    ? Math.round((totalVistas / totalCuriosidades) * 100)
    : 0;

  return (
    <div className="min-h-full p-5 pb-28">
      <header className="mb-5">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <span aria-hidden>{saudacao.icone}</span>
          <span>{saudacao.texto}</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-slate-50 leading-tight mt-1">
          Curioso
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Aprenda uma curiosidade nova a cada toque.
        </p>

        <div className="mt-4 flex items-stretch gap-2">
          {streakAtual > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30"
              aria-label={`Streak de ${streakAtual} dias`}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-amber-200 tabular-nums">
                  {streakAtual} {streakAtual === 1 ? "dia" : "dias"}
                </div>
                {streakMelhor > streakAtual && (
                  <div className="text-[10px] text-amber-300/70">
                    Melhor: {streakMelhor}
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onAbrirFavoritos}
            className="relative ml-auto flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            aria-label={`Abrir favoritos (${totalFavoritos})`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium text-slate-200">
              Favoritos
            </span>
            {totalFavoritos > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white px-1">
                {totalFavoritos}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Bloco "Curiosidade de hoje" */}
      {curiosidadeDoDia && temaDoDia && (
        <button
          type="button"
          onClick={() => onAbrirCuriosidade(curiosidadeDoDia)}
          className="group block w-full text-left rounded-2xl p-[1.5px] mb-5 transition-transform hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${temaDoDia.cor}, ${temaDoDia.cor}88 60%, #F472B6 100%)`,
          }}
        >
          <div className="rounded-[14px] bg-slate-900 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-300">
              <Sparkles
                className="w-3.5 h-3.5"
                style={{ color: temaDoDia.cor }}
              />
              Curiosidade de hoje
            </div>
            <p className="mt-2 text-[1.05rem] leading-snug text-slate-50 font-medium text-balance">
              {curiosidadeDoDia.texto}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span
                className="text-xs font-medium"
                style={{ color: temaDoDia.cor }}
              >
                {temaDoDia.emoji} {temaDoDia.nome}
              </span>
              <span className="text-xs text-slate-300 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Abrir <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </button>
      )}

      {/* Card de progresso geral */}
      <div className="mb-5 rounded-2xl bg-slate-900/70 border border-slate-800 p-4 flex items-center gap-3">
        <Sun
          className="w-5 h-5 text-amber-300"
          style={{ transform: "rotate(0deg)" }}
        />
        <div className="flex-1">
          <div className="text-xs text-slate-400">Você já descobriu</div>
          <div className="text-sm font-semibold text-slate-100">
            {totalVistas} de {totalCuriosidades} curiosidades ({percentualGeral}%)
          </div>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
        Temas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {temas.map((tema) => (
          <CartaoTema
            key={tema.id}
            tema={tema}
            total={contagemPorTema[tema.id] ?? 0}
            vistas={vistasPorTema[tema.id] ?? 0}
            favoritos={favoritosPorTema[tema.id] ?? 0}
            onClick={() => onAbrirTema(tema.id)}
          />
        ))}
      </div>
    </div>
  );
}
