import { useEffect, useRef } from "react";

interface ParticulasProps {
  cor: string;
  quantidade?: number;
}

interface Particula {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
}

export function Particulas({ cor, quantidade = 8 }: ParticulasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduzido = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduzido) {
      const w = canvas.width;
      const h = canvas.height;
      for (let i = 0; i < quantidade; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * w,
          Math.random() * h,
          1.2 + Math.random() * 1.5,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `${cor}55`;
        ctx.fill();
      }
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const particulas: Particula[] = Array.from({ length: quantidade }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      alpha: 0.25 + Math.random() * 0.45,
    }));

    const dprConst = dpr;
    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      for (const p of particulas) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(
          p.x / dprConst,
          p.y / dprConst,
          p.r,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = `${cor}${Math.floor(p.alpha * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.fill();
      }
      animRef.current = window.requestAnimationFrame(loop);
    };
    animRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (animRef.current !== null) window.cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [cor, quantidade]);

  return <canvas ref={canvasRef} className="particulas-canvas" aria-hidden />;
}
