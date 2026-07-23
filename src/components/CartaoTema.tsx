import type { Tema } from "../lib/tipos";
import { BarraProgresso } from "./BarraProgresso";

interface CartaoTemaProps {
  tema: Tema;
  total: number;
  vistas: number;
  favoritos: number;
  onClick: () => void;
}

export function CartaoTema({
  tema,
  total,
  vistas,
  favoritos,
  onClick,
}: CartaoTemaProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left flex flex-col gap-3 p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl"
          style={{ backgroundColor: `${tema.cor}26` }}
        >
          <span aria-hidden>{tema.emoji}</span>
        </div>
        {favoritos > 0 && (
          <span className="text-xs text-yellow-400 font-medium px-2 py-1 rounded-full bg-yellow-400/10">
            ★ {favoritos}
          </span>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-slate-100 leading-tight">
          {tema.nome}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
          {tema.descricao}
        </p>
      </div>
      <BarraProgresso
        atual={vistas}
        total={total}
        cor={tema.cor}
        etiqueta={vistas === total && total > 0 ? "Completo" : "Vistas"}
      />
    </button>
  );
}
