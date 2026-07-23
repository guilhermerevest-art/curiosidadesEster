import { Heart } from "lucide-react";
import type { Tema } from "../lib/tipos";
import { CartaoTema } from "./CartaoTema";

interface TelaTemasProps {
  temas: Tema[];
  contagemPorTema: Record<string, number>;
  vistasPorTema: Record<string, number>;
  favoritosPorTema: Record<string, number>;
  onAbrirTema: (temaId: string) => void;
  onAbrirFavoritos: () => void;
}

export function TelaTemas({
  temas,
  contagemPorTema,
  vistasPorTema,
  favoritosPorTema,
  onAbrirTema,
  onAbrirFavoritos,
}: TelaTemasProps) {
  const totalFavoritos = Object.values(favoritosPorTema).reduce(
    (s, n) => s + n,
    0,
  );

  return (
    <div className="min-h-full p-5 pb-28">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 leading-tight">
            Curioso
          </h1>
          <p className="text-sm text-slate-400">
            Aprenda uma curiosidade nova a cada toque.
          </p>
        </div>
        <button
          type="button"
          onClick={onAbrirFavoritos}
          className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
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
      </header>

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
