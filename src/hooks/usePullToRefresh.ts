import { useCallback, useEffect, useRef, useState } from "react";

interface UsePullToRefresh {
  arrastando: boolean;
  puxou: boolean; // passou o threshold
  progresso: number; // 0..1
  onRefresh: () => void;
  bind: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

const THRESHOLD = 80;
const MAX = 130;

export function usePullToRefresh(onRefresh: () => void | Promise<void>): UsePullToRefresh {
  const [arrastando, setArrastando] = useState(false);
  const [distancia, setDistancia] = useState(0);
  const inicioY = useRef<number | null>(null);
  const scrollTop = useRef<number>(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    const target = e.currentTarget as HTMLElement;
    // Só permite pull se estiver no topo da scroll
    scrollTop.current = target.scrollTop ?? 0;
    if (scrollTop.current > 4) {
      inicioY.current = null;
      return;
    }
    inicioY.current = t.clientY;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (inicioY.current === null) return;
    const t = e.touches[0];
    if (!t) return;
    const delta = t.clientY - inicioY.current;
    if (delta < 0) {
      setDistancia(0);
      setArrastando(false);
      return;
    }
    // Resistência: quanto mais puxou, mais "pesado"
    const d = Math.min(MAX, delta * 0.5);
    setDistancia(d);
    setArrastando(d > 4);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (inicioY.current === null) return;
    const d = distancia;
    inicioY.current = null;
    setArrastando(false);
    setDistancia(0);
    if (d >= THRESHOLD) {
      void onRefresh();
    }
  }, [distancia, onRefresh]);

  const progresso = Math.min(1, distancia / MAX);

  // listener nativo: bloquear scroll se estiver puxando
  useEffect(() => {
    if (!arrastando) return;
    const prev = document.body.style.overscrollBehavior;
    document.body.style.overscrollBehavior = "contain";
    return () => {
      document.body.style.overscrollBehavior = prev;
    };
  }, [arrastando]);

  return {
    arrastando,
    puxou: progresso >= THRESHOLD / MAX,
    progresso,
    onRefresh,
    bind: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
