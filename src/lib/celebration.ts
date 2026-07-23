import confetti from "canvas-confetti";

const CHAVE = "curioso:confete:v1";

function reduzido(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

function jaDisparou(chave: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const set = bruto ? (JSON.parse(bruto) as string[]) : [];
    return set.includes(chave);
  } catch {
    return false;
  }
}

function marcarDisparado(chave: string) {
  if (typeof window === "undefined") return;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const set = bruto ? (JSON.parse(bruto) as string[]) : [];
    if (!set.includes(chave)) {
      set.push(chave);
      window.localStorage.setItem(CHAVE, JSON.stringify(set));
    }
  } catch {
    // silencioso
  }
}

function disparar(cores: string[]) {
  if (reduzido()) return;
  // dois jatos para um efeito "uau" sem exagero
  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 35,
    origin: { x: 0.2, y: 0.85 },
    colors: cores,
  });
  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 35,
    origin: { x: 0.8, y: 0.85 },
    colors: cores,
  });
}

export function celebrar(temaId: string, marco: 25 | 50 | 100, cor: string) {
  const chave = `${temaId}:${marco}`;
  if (jaDisparou(chave)) return;
  marcarDisparado(chave);

  const cores = [cor, "#FBBF24", "#F472B6", "#A78BFA", "#34D399"];
  disparar(cores);
}
