import { ArrowLeft, Heart } from "lucide-react";
import type { Curiosidade, Tema } from "../lib/tipos";
import { EmptyFavoritos } from "./EmptyFavoritos";

interface TelaFavoritosProps {
  favoritos: Curiosidade[];
  temas: Map<string, Tema>;
  onVoltar: () => void;
  onAbrirTema: (temaId: string) => void;
  onRemoverFavorito: (curiosidade: Curiosidade) => void;
  onExplorarTemas: () => void;
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
  onExplorarTemas,
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
      <header className="sticky top-0 z-10 backdrop-blur-md bg-app/80 border-b border-app">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onVoltar}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-app-2 hover:bg-card-2"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Heart className="w-5 h-5 text-rose-400" />
            <h2 className="font-semibold text-app">Favoritos</h2>
          </div>
          {favoritos.length > 0 && (
            <span className="text-xs text-app-3 tabular-nums">
              {favoritos.length} {favoritos.length === 1 ? "item" : "itens"}
            </span>
          )}
        </div>
      </header>

      <div className="p-5 pb-20">
        {favoritos.length === 0 ? (
          <EmptyFavoritos onExplorar={onExplorarTemas} />
        ) : (
          <div className="space-y-6">
            {grupos.map(({ tema, itens }) => (
              <section key={tema.id}>
                <button
                  type="button"
                  onClick={() => onAbrirTema(tema.id)}
                  className="flex items-center gap-2 mb-2 text-sm font-semibold text-app-2 hover:text-app"
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
                      className="rounded-xl border bg-card p-4 flex items-start gap-3"
                      style={{ borderColor: `${tema.cor}40` }}
                    >
                      <p className="flex-1 text-sm text-app-2 leading-relaxed">
                        {c.texto}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemoverFavorito(c)}
                        className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-app-3 hover:text-rose-400 hover:bg-card-2"
                        aria-label="Remover dos favoritos"
                      >
                        <Heart className="w-4 h-4" fill="currentColor" />
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
