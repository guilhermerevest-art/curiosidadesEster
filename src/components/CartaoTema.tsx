import type { Tema } from "../lib/tipos";
import { BarraProgresso } from "./BarraProgresso";
import { SeloConquista } from "./SeloConquista";

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
  const completo = total > 0 && vistas >= total;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group text-left flex flex-col gap-3 p-4 rounded-2xl bg-card border transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",
        completo
          ? "border-yellow-400/40 hover:border-yellow-400/70"
          : "border-app hover:border-app-2",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl"
          style={{ backgroundColor: `${tema.cor}26` }}
        >
          <span aria-hidden>{tema.emoji}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          {completo && <SeloConquista cor={tema.cor} />}
          {favoritos > 0 && (
            <span className="text-xs text-yellow-400 font-medium px-2 py-1 rounded-full bg-yellow-400/10">
              ★ {favoritos}
            </span>
          )}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-app leading-tight">{tema.nome}</h3>
        <p className="text-xs text-app-3 mt-0.5 line-clamp-2">
          {tema.descricao}
        </p>
      </div>
      <BarraProgresso
        atual={vistas}
        total={total}
        cor={tema.cor}
        etiqueta={completo ? "Completo" : "Vistas"}
      />
    </button>
  );
}
