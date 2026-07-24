import { useCallback, useRef } from "react";

interface UseSom {
  habilitado: boolean;
  pageTurn: () => void;
  tick: () => void;
  setHabilitado: (v: boolean) => void;
}

const CHAVE = "curioso:som:v1";

function carregarPrefer(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = window.localStorage.getItem(CHAVE);
    return v === "1";
  } catch {
    return false;
  }
}

function salvarPrefer(v: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE, v ? "1" : "0");
  } catch {
    // silencioso
  }
}

export function useSom(): UseSom {
  const ctxRef = useRef<AudioContext | null>(null);
  const refOn = useRef<boolean>(carregarPrefer());

  const garantirCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!ctxRef.current) {
      try {
        ctxRef.current = new Ctor();
      } catch {
        return null;
      }
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (frequencia: number, duracao: number, volume: number) => {
      if (!refOn.current) return;
      const ctx = garantirCtx();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(frequencia, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duracao);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duracao);
      } catch {
        // silencioso
      }
    },
    [garantirCtx],
  );

  const pageTurn = useCallback(() => {
    // som curtinho "raspar" descendente
    const ctx = garantirCtx();
    if (!ctx) return;
    if (!refOn.current) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // silencioso
    }
  }, [garantirCtx]);

  const tick = useCallback(() => {
    play(1800, 0.04, 0.03);
  }, [play]);

  const setHabilitado = useCallback((v: boolean) => {
    refOn.current = v;
    salvarPrefer(v);
  }, []);

  return {
    habilitado: refOn.current,
    pageTurn,
    tick,
    setHabilitado,
  };
}
