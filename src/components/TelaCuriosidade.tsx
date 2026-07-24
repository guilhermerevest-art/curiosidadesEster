import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  Pause,
  Share2,
  Volume2,
  Image as ImageIcon,
} from "lucide-react";
import type { Curiosidade, Tema } from "../lib/tipos";
import { CartaoCuriosidade } from "./CartaoCuriosidade";
import { Toast } from "./Toast";
import { PullToRefreshIndicator } from "./PullToRefreshIndicator";
import { useHaptics } from "../hooks/useHaptics";
import { useShare } from "../hooks/useShare";
import { useTTS } from "../hooks/useTTS";
import { useSom } from "../hooks/useSom";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { renderStoryCard } from "../lib/storyCard";

interface TelaCuriosidadeProps {
  tema: Tema;
  atual: Curiosidade | null;
  total: number;
  numeroAtual: number;
  indiceVista: number;
  ehFavorito: boolean;
  esgotouNaoVistas: boolean;
  imagemUrl?: string;
  onVoltar: () => void;
  onProxima: () => void;
  onJaSabia: () => void;
  onFavoritar: () => void;
  onAleatoria: () => void;
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
  imagemUrl,
  onVoltar,
  onProxima,
  onJaSabia,
  onFavoritar,
  onAleatoria,
}: TelaCuriosidadeProps) {
  const haptics = useHaptics();
  const { compartilharTexto, compartilharArquivo, copiado, compartilhado } = useShare();
  const tts = useTTS();
  const som = useSom();

  const [estado, setEstado] = useState<"entrando" | "saindo">("entrando");
  const [animandoFav, setAnimandoFav] = useState(false);
  const [arrastando, setArrastando] = useState<{ x: number; rot: number } | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const [gerandoStory, setGerandoStory] = useState(false);

  const toqueInicioX = useRef<number | null>(null);
  const toqueInicioT = useRef<number | null>(null);
  const ultimoToqueT = useRef<number>(0);
  const contadorToque = useRef<number>(0);
  const timerDouble = useRef<number | null>(null);

  // Pull-to-refresh: trocar para curiosidade aleatória
  const ptr = usePullToRefresh(async () => {
    haptics.vibrar("conquista");
    som.tick();
    onAleatoria();
  });

  useEffect(() => {
    setEstado("entrando");
    if (atual) tts.carregar(atual.texto);
    // se tava falando, para
    if (tts.falando || tts.pausado) tts.parar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atual?.id]);

  if (!atual) {
    return (
      <div className="min-h-full flex items-center justify-center text-app-3">
        Carregando…
      </div>
    );
  }

  function moverToque(e: React.TouchEvent) {
    if (toqueInicioX.current === null || ptr.arrastando) return;
    const x = e.touches[0]?.clientX ?? 0;
    const delta = x - toqueInicioX.current;
    const limit = Math.max(-140, Math.min(140, delta));
    // vibração sutil ao passar 50% do threshold (feedback de "compromisso")
    if (Math.abs(delta) > LIMIAR_SWIPE && Math.abs(delta) < LIMIAR_SWIPE + 10) {
      haptics.vibrar("swipe-curto");
    }
    setArrastando({ x: limit, rot: limit / 12 });
  }

  function terminarToque(e: React.TouchEvent) {
    if (toqueInicioX.current === null) return;
    const fim = e.changedTouches[0]?.clientX ?? 0;
    const delta = fim - toqueInicioX.current;
    const duracao = Date.now() - (toqueInicioT.current ?? Date.now());
    toqueInicioX.current = null;
    toqueInicioT.current = null;
    setArrastando(null);
    if (Math.abs(delta) > LIMIAR_SWIPE || (delta < 0 && duracao < 250)) {
      dispararProxima();
    }
  }

  // double-tap = "Já sabia"
  function onTapCartao(e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) {
    const agora = Date.now();
    if (agora - ultimoToqueT.current < 280) {
      contadorToque.current += 1;
      if (contadorToque.current >= 1) {
        contadorToque.current = 0;
        if (timerDouble.current) {
          window.clearTimeout(timerDouble.current);
          timerDouble.current = null;
        }
        // feedback visual ripple
        let cx = 0, cy = 0;
        const me = e as React.MouseEvent<HTMLElement>;
        if ("clientX" in me && typeof me.clientX === "number") {
          cx = me.clientX;
          cy = me.clientY;
        } else {
          const target = e.currentTarget as HTMLElement;
          const r = target.getBoundingClientRect();
          cx = r.left + r.width / 2;
          cy = r.top + r.height / 2;
        }
        setRipple({ x: cx, y: cy });
        window.setTimeout(() => setRipple(null), 600);
        haptics.vibrar("ribble");
        dispararJaSabia();
      }
    } else {
      contadorToque.current = 0;
      ultimoToqueT.current = agora;
    }
  }

  function dispararProxima() {
    haptics.vibrar("swice-longo");
    som.pageTurn();
    setEstado("saindo");
    window.setTimeout(onProxima, DURACAO_ANIM_SAIDA);
  }

  function dispararJaSabia() {
    haptics.vibrar("selecionado");
    setEstado("saindo");
    window.setTimeout(onJaSabia, DURACAO_ANIM_SAIDA);
  }

  function dispararFavoritar() {
    if (ehFavorito) haptics.vibrar("desfavoritar");
    else haptics.vibrar("favorito");
    setAnimandoFav(true);
    window.setTimeout(() => setAnimandoFav(false), 350);
    onFavoritar();
  }

  function dispararCompartilharTexto() {
    haptics.vibrar("tap");
    const texto = `Você sabia? ${atual?.texto ?? ""} — via Curioso`;
    void compartilharTexto(texto);
  }

  async function dispararCompartilharImagem() {
    if (!atual || gerandoStory) return;
    haptics.vibrar("tap");
    setGerandoStory(true);
    try {
      const blob = await renderStoryCard({ curiosidade: atual, tema });
      const arquivo = new File([blob], `curioso-${tema.id}.png`, {
        type: "image/png",
      });
      await compartilharArquivo(arquivo, "Curioso", atual.texto);
    } catch {
      // silencioso
    } finally {
      setGerandoStory(false);
    }
  }

  function dispararTTS() {
    if (!tts.disponivel) return;
    if (tts.falando && !tts.pausado) {
      haptics.vibrar("selecionado");
      tts.pause();
    } else if (tts.pausado) {
      haptics.vibrar("selecionado");
      tts.play();
    } else {
      haptics.vibrar("tap");
      if (atual) tts.carregar(atual.texto);
      tts.play();
    }
  }

  const transformArrasto =
    arrastando !== null
      ? `translateX(${arrastando.x}px) rotate(${arrastando.rot}deg)`
      : undefined;

  return (
    <div
      className="min-h-full flex flex-col"
      onTouchStart={ptr.bind.onTouchStart}
      onTouchMove={(e) => {
        moverToque(e);
        ptr.bind.onTouchMove(e);
      }}
      onTouchEnd={(e) => {
        terminarToque(e);
        ptr.bind.onTouchEnd();
      }}
    >
      <header
        className="sticky top-0 z-10 backdrop-blur-md bg-app/80 border-b"
        style={{ borderBottomColor: `${tema.cor}55` }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onVoltar}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-app-2 hover:bg-card-2"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>
                {tema.emoji}
              </span>
              <h2 className="font-semibold text-app truncate">
                {tema.nome}
              </h2>
            </div>
            <p className="text-xs text-app-3 mt-0.5">
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
        <div className="h-1 w-full bg-card-2">
          <div
            className="h-full transition-[width] duration-500 ease-out"
            style={{
              width: `${Math.min(100, (indiceVista / Math.max(total, 1)) * 100)}%`,
              backgroundColor: tema.cor,
            }}
          />
        </div>
      </header>

      <PullToRefreshIndicator
        progresso={ptr.progresso}
        carregando={ptr.arrastando && ptr.puxou}
        cor={tema.cor}
      />

      <div className="flex-1 flex items-center justify-center p-5">
        <div
          className="w-full max-w-md select-none"
          style={{
            transform: transformArrasto,
            transition: arrastando ? "none" : "transform 280ms ease",
          }}
          onClick={onTapCartao}
        >
          <CartaoCuriosidade
            tema={tema}
            curiosidade={atual}
            numeroAtual={numeroAtual}
            total={total}
            direcao={null}
            estado={estado}
            imagemUrl={imagemUrl}
          />
        </div>
        {ripple && (
          <span
            className="ripple"
            aria-hidden
            style={{
              left: ripple.x,
              top: ripple.y,
              backgroundColor: tema.cor,
            }}
          />
        )}
        <button
          type="button"
          onClick={dispararFavoritar}
          className={[
            "fixed top-20 right-4 z-20 flex items-center justify-center w-11 h-11 rounded-full border backdrop-blur-md shadow-lg",
            ehFavorito
              ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
              : "bg-card/80 border-app-2 text-app-2",
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

      <footer className="sticky bottom-0 bg-app/90 backdrop-blur-md border-t border-app p-4">
        <div className="max-w-md mx-auto flex items-stretch gap-2">
          <button
            type="button"
            onClick={dispararJaSabia}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl border border-app-2 bg-card text-app-2 font-medium hover:bg-card-2 active:scale-[0.98] transition"
            aria-label="Marcar como já sabia"
          >
            <CheckCircle2 className="w-4 h-4" />
            Já sabia
          </button>
          <button
            type="button"
            onClick={dispararTTS}
            disabled={!tts.disponivel}
            className="flex items-center justify-center w-12 h-12 rounded-2xl border border-app-2 bg-card text-app-2 hover:bg-card-2 active:scale-[0.98] transition disabled:opacity-40"
            aria-label={
              tts.falando && !tts.pausado
                ? "Pausar leitura"
                : tts.pausado
                  ? "Continuar leitura"
                  : "Ouvir"
            }
            title={!tts.disponivel ? "Leitura em voz alta indisponível" : undefined}
          >
            {tts.falando && !tts.pausado ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={dispararCompartilharImagem}
            disabled={gerandoStory}
            className="flex items-center justify-center w-12 h-12 rounded-2xl border border-app-2 bg-card text-app-2 hover:bg-card-2 active:scale-[0.98] transition disabled:opacity-40"
            aria-label="Compartilhar como imagem"
            title="Compartilhar como imagem"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={dispararCompartilharTexto}
            className="flex items-center justify-center w-12 h-12 rounded-2xl border border-app-2 bg-card text-app-2 hover:bg-card-2 active:scale-[0.98] transition"
            aria-label="Compartilhar texto"
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
        <p className="mt-2 text-center text-[10px] text-app-3 opacity-70">
          Dica: arraste para baixo para uma surpresa, ou toque duas vezes
          para marcar como já sabia.
        </p>
        {esgotouNaoVistas && total > 0 && (
          <p className="mt-2 text-center text-xs text-app-3">
            Você já viu todas as {total} curiosidades deste tema. Vamos
            repassá-las!
          </p>
        )}
        {(copiado || compartilhado) && (
          <Toast
            mensagem={
              compartilhado
                ? "Compartilhado!"
                : gerandoStory
                  ? "Gerando imagem…"
                  : "Texto copiado para a área de transferência"
            }
          />
        )}
      </footer>
    </div>
  );
}
