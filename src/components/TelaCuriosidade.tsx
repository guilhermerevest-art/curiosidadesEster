import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  Share2,
} from "lucide-react";
import type { Curiosidade, Tema } from "../lib/tipos";
import { CartaoCuriosidade } from "./CartaoCuriosidade";
import { Toast } from "./Toast";
import { useHaptics } from "../hooks/useHaptics";
import { useShare } from "../hooks/useShare";

interface TelaCuriosidadeProps {
  tema: Tema;
  atual: Curiosidade | null;
  total: number;
  numeroAtual: number; // 1-based para "Curiosidade #N"
  indiceVista: number;
  ehFavorito: boolean;
  esgotouNaoVistas: boolean;
  onVoltar: () => void;
  onProxima: () => void;
  onJaSabia: () => void;
  onFavoritar: () => void;
}

const DURACAO_ANIM_SAIDA = 280;
const LIMIAR_SWIPE = 60;

export function TelaCuriosidade({
  tema,
  atual,
  total,
  numeroAtual,
  indiceVista,
  ehFavorito,
  esgotouNaoVistas,
  onVoltar,
  onProxima,
  onJaSabia,
  onFavoritar,
}: TelaCuriosidadeProps) {
  const haptics = useHaptics();
  const { compartilhar, copiado } = useShare();

  const [estado, setEstado] = useState<"entrando" | "saindo">("entrando");
  const [animandoFav, setAnimandoFav] = useState(false);
  const [arrastando, setArrastando] = useState<{
    x: number;
    rot: number;
  } | null>(null);

  const toqueInicioX = useRef<number | null>(null);
  const toqueInicioT = useRef<number | null>(null);
  const botaoFavRef = useRef<HTMLButtonElement | null>(null);

  // quando o id muda, reset da animação de entrada
  useEffect(() => {
    setEstado("entrando");
  }, [atual?.id]);

  // se vier vazio, nada
  if (!atual) {
    return (
      <div className="min-h-full flex items-center justify-center text-slate-400">
        Carregando…
      </div>
    );
  }

  function iniciarToque(e: React.TouchEvent) {
    toqueInicioX.current = e.touches[0]?.clientX ?? null;
    toqueInicioT.current = Date.now();
  }

  function moverToque(e: React.TouchEvent) {
    if (toqueInicioX.current === null) return;
    const x = e.touches[0]?.clientX ?? 0;
    const delta = x - toqueInicioX.current;
    // limite para não arrastar absurdo
    const limit = Math.max(-140, Math.min(140, delta));
    setArrastando({
      x: limit,
      rot: limit / 12,
    });
  }

  function terminarToque(e: React.TouchEvent) {
    if (toqueInicioX.current === null) return;
    const fim = e.changedTouches[0]?.clientX ?? 0;
    const delta = fim - toqueInicioX.current;
    const duracao = Date.now() - (toqueInicioT.current ?? Date.now());
    toqueInicioX.current = null;
    toqueInicioT.current = null;
    setArrastando(null);
    // se arrastou longe OU foi um flick rápido, conta como próximo
    if (Math.abs(delta) > LIMIAR_SWIPE || (delta < 0 && duracao < 250)) {
      dispararProxima();
    }
  }

  function dispararProxima() {
    haptics.vibrar("tap");
    setEstado("saindo");
    window.setTimeout(onProxima, DURACAO_ANIM_SAIDA);
  }

  function dispararJaSabia() {
    haptics.vibrar("selecionado");
    setEstado("saindo");
    window.setTimeout(onJaSabia, DURACAO_ANIM_SAIDA);
  }

  function dispararFavoritar() {
    haptics.vibrar("favorito");
    setAnimandoFav(true);
    window.setTimeout(() => setAnimandoFav(false), 350);
    onFavoritar();
  }

  function dispararCompartilhar() {
    haptics.vibrar("tap");
    const texto = `Você sabia? ${atual?.texto ?? ""} — via Curioso`;
    void compartilhar(texto);
  }

  // visual do cartão: se estamos arrastando, segue o dedo; se está entrando, usa a classe
  const transformArrasto =
    arrastando !== null
      ? `translateX(${arrastando.x}px) rotate(${arrastando.rot}deg)`
      : undefined;

  return (
    <div className="min-h-full flex flex-col">
      <header
        className="sticky top-0 z-10 backdrop-blur-md bg-slate-950/70 border-b"
        style={{ borderBottomColor: `${tema.cor}55` }}
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
              Progresso {Math.min(indiceVista, total)}/{total}
            </p>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums"
            style={{
              backgroundColor: `${tema.cor}26`,
              color: tema.cor,
            }}
          >
            {Math.min(indiceVista, total)}/{total}
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
        <div
          className="w-full max-w-md select-none"
          onTouchStart={iniciarToque}
          onTouchMove={moverToque}
          onTouchEnd={terminarToque}
          style={{
            transform: transformArrasto,
            transition: arrastando ? "none" : "transform 280ms ease",
          }}
        >
          <CartaoCuriosidade
            tema={tema}
            curiosidade={atual}
            numeroAtual={numeroAtual}
            total={total}
            direcao={null}
            estado={estado}
          />
        </div>
        <button
          ref={botaoFavRef}
          type="button"
          onClick={dispararFavoritar}
          className={[
            "fixed top-20 right-4 z-20 flex items-center justify-center w-11 h-11 rounded-full border backdrop-blur-md shadow-lg",
            ehFavorito
              ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
              : "bg-slate-900/80 border-slate-700 text-slate-300",
            animandoFav ? "heart-pulse" : "",
          ].join(" ")}
          aria-label={ehFavorito ? "Remover dos favoritos" : "Favoritar"}
          aria-pressed={ehFavorito}
        >
          <Heart
            className="w-5 h-5"
            fill={ehFavorito ? "currentColor" : "none"}
          />
          {animandoFav && (
            <span className="heart-fly" aria-hidden>
              <Heart
                className="w-6 h-6 text-rose-400"
                fill="currentColor"
              />
            </span>
          )}
        </button>
      </div>

      <footer className="sticky bottom-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-4">
        <div className="max-w-md mx-auto flex items-stretch gap-3">
          <button
            type="button"
            onClick={dispararJaSabia}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl border border-slate-700 bg-slate-900 text-slate-200 font-medium hover:bg-slate-800 active:scale-[0.98] transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            Já sabia
          </button>
          <button
            type="button"
            onClick={dispararCompartilhar}
            className="flex items-center justify-center w-12 h-12 rounded-2xl border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 active:scale-[0.98] transition"
            aria-label="Compartilhar"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={dispararProxima}
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
        {copiado && <Toast mensagem="Texto copiado para a área de transferência" />}
      </footer>
    </div>
  );
}
