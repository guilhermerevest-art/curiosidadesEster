import { ArrowLeft, Heart } from "lucide-react";
import type { Curiosidade, Tema } from "../lib/tipos";

interface TelaFavoritosProps {
  favoritos: Curiosidade[];
  temas: Map<string, Tema>;
  onVoltar: () => void;
  onAbrirTema: (temaId: string) => void;
  onRemoverFavorito: (curiosidade: Curiosidade) => void;
}

interface Grupo {
  tema: Tema;
  itens: Curiosidade[];
}

export function TelaFavoritos({
  favoritos,
  temas,
  onVoltar,
  onAbrirTema,
  onRemoverFavorito,
}: TelaFavoritosProps) {
  const grupos: Grupo[] = (() => {
    const mapa = new Map<string, Curiosidade[]>();
    for (const fav of favoritos) {
      const lista = mapa.get(fav.temaId) ?? [];
      lista.push(fav);
      mapa.set(fav.temaId, lista);
    }
    const resultado: Grupo[] = [];
    for (const [temaId, itens] of mapa) {
      const tema = temas.get(temaId);
      if (tema) resultado.push({ tema, itens });
    }
    return resultado.sort((a, b) => a.tema.nome.localeCompare(b.tema.nome));
  })();

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/80">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onVoltar}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-300 hover:bg-slate-800"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Heart className="w-5 h-5 text-rose-400" />
            <h2 className="font-semibold text-slate-100">Favoritos</h2>
          </div>
          {favoritos.length > 0 && (
            <span className="text-xs text-slate-400 tabular-nums">
              {favoritos.length} {favoritos.length === 1 ? "item" : "itens"}
            </span>
          )}
        </div>
      </header>

      <div className="p-5 pb-20">
        {favoritos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 text-slate-400 gap-2">
            <Heart className="w-10 h-10 text-slate-600" />
            <p className="text-base">Nenhum favorito ainda</p>
            <p className="text-sm max-w-xs">
              Toque no ícone de coração nas suas curiosidades favoritas para
              vê-las aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {grupos.map(({ tema, itens }) => (
              <section key={tema.id}>
                <button
                  type="button"
                  onClick={() => onAbrirTema(tema.id)}
                  className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-200 hover:text-white"
                >
                  <span className="text-xl" aria-hidden>
                    {tema.emoji}
                  </span>
                  {tema.nome}
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                    style={{
                      backgroundColor: `${tema.cor}26`,
                      color: tema.cor,
                    }}
                  >
                    {itens.length}
                  </span>
                </button>
                <ul className="space-y-2">
                  {itens.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-xl border bg-slate-900/70 p-4 flex items-start gap-3"
                      style={{ borderColor: `${tema.cor}40` }}
                    >
                      <p className="flex-1 text-sm text-slate-200 leading-relaxed">
                        {c.texto}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemoverFavorito(c)}
                        className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        aria-label="Remover dos favoritos"
                      >
                        <Heart
                          className="w-4 h-4"
                          fill="currentColor"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
