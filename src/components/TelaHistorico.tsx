import { useMemo, useState } from "react";
import { ArrowLeft, Heart, Search } from "lucide-react";
import type { Curiosidade, Tema } from "../lib/tipos";

interface ItemHistorico {
  c: Curiosidade;
  dataIso: string;
}

interface TelaHistoricoProps {
  itens: ItemHistorico[];
  temas: Map<string, Tema>;
  onVoltar: () => void;
  onAbrirTema: (temaId: string) => void;
  onRemoverFavorito: (curiosidade: Curiosidade) => void;
}

function dataCurta(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
}

export function TelaHistorico({
  itens,
  temas,
  onVoltar,
  onAbrirTema,
  onRemoverFavorito,
}: TelaHistoricoProps) {
  const [filtro, setFiltro] = useState<"todos" | string>("todos");
  const [busca, setBusca] = useState("");

  const grupos = useMemo(() => {
    const lista = filtro === "todos" ? itens : itens.filter((i) => i.c.temaId === filtro);
    const q = busca.trim().toLowerCase();
    const filtrada = q
      ? lista.filter((i) => i.c.texto.toLowerCase().includes(q))
      : lista;
    const porData = new Map<string, ItemHistorico[]>();
    for (const item of filtrada) {
      const d = item.dataIso.slice(0, 10);
      const arr = porData.get(d) ?? [];
      arr.push(item);
      porData.set(d, arr);
    }
    return Array.from(porData.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [itens, filtro, busca]);

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
          <div className="flex-1">
            <h2 className="font-semibold text-app">Histórico</h2>
            <p className="text-xs text-app-3">{itens.length} {itens.length === 1 ? "curiosidade vista" : "curiosidades vistas"}</p>
          </div>
        </div>
        <div className="px-4 pb-3 flex flex-col gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-3" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar no histórico…"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-app text-sm text-app placeholder:text-app-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin">
            <button
              type="button"
              onClick={() => setFiltro("todos")}
              className={[
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition",
                filtro === "todos"
                  ? "bg-sky-500/20 text-sky-200 border border-sky-400/40"
                  : "bg-card border border-app text-app-2",
              ].join(" ")}
            >
              Todos
            </button>
            {Array.from(temas.values()).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFiltro(t.id)}
                className={[
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition flex items-center gap-1",
                  filtro === t.id
                    ? "border"
                    : "bg-card border border-app text-app-2",
                ].join(" ")}
                style={
                  filtro === t.id
                    ? {
                        backgroundColor: `${t.cor}26`,
                        borderColor: `${t.cor}55`,
                        color: t.cor,
                      }
                    : undefined
                }
              >
                <span aria-hidden>{t.emoji}</span>
                {t.nome}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="p-5 pb-20">
        {itens.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 text-app-3">
            <p>Nenhuma curiosidade vista ainda.</p>
            <p className="text-sm">Explore os temas para começar.</p>
          </div>
        ) : grupos.length === 0 ? (
          <div className="text-center text-app-3 py-12">
            Nenhum resultado para esses filtros.
          </div>
        ) : (
          <div className="space-y-6">
            {grupos.map(([data, lista]) => (
              <section key={data}>
                <p className="text-[10px] uppercase tracking-wider text-app-3 mb-2 font-semibold">
                  {dataCurta(data)} · {lista.length}
                </p>
                <ul className="space-y-2">
                  {lista.map((item) => {
                    const tema = temas.get(item.c.temaId);
                    return (
                      <li
                        key={item.c.id}
                        className="rounded-xl border bg-card p-4"
                        style={{ borderColor: `${tema?.cor ?? "#94a3b8"}40` }}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => tema && onAbrirTema(tema.id)}
                            className="flex items-center gap-2 text-[10px] uppercase tracking-wider mb-1 font-semibold text-app-3 hover:text-app-2"
                            style={{ color: tema?.cor }}
                          >
                            <span aria-hidden>{tema?.emoji}</span>
                            {tema?.nome}
                          </button>
                        </div>
                        <p className="text-sm text-app-2 leading-relaxed">
                          {item.c.texto}
                        </p>
                        <div className="mt-2 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => onRemoverFavorito(item.c)}
                            className="text-xs text-app-3 hover:text-rose-400 inline-flex items-center gap-1"
                            aria-label="Remover dos favoritos"
                          >
                            <Heart className="w-3.5 h-3.5" fill="currentColor" />
                            remover
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
