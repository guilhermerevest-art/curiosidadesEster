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

function corClara(cor: string): string {
  // mistura a cor com branco
  return `color-mix(in srgb, ${cor} 70%, #ffffff 30%)`;
}

function corEscura(cor: string): string {
  return `color-mix(in srgb, ${cor} 80%, #000000 20%)`;
}

function disparar(cores: string[], intensidade: "baixa" | "media" | "alta" = "media") {
  if (reduzido()) return;
  const params = {
    baixa: { particleCount: 50, spread: 60, startVelocity: 28 },
    media: { particleCount: 90, spread: 80, startVelocity: 38 },
    alta: { particleCount: 150, spread: 100, startVelocity: 50 },
  }[intensidade];
  // 3 jatos: esquerda, centro, direita
  confetti({
    ...params,
    origin: { x: 0.18, y: 0.85 },
    colors: cores,
  });
  confetti({
    ...params,
    origin: { x: 0.5, y: 0.7 },
    colors: cores,
  });
  confetti({
    ...params,
    origin: { x: 0.82, y: 0.85 },
    colors: cores,
  });
}

export function celebrar(temaId: string, marco: 25 | 50 | 100, cor: string) {
  const chave = `${temaId}:${marco}`;
  if (jaDisparou(chave)) return;
  marcarDisparado(chave);

  const cores = [
    cor,
    corClara(cor),
    corEscura(cor),
    "#FBBF24", // dourado para "premio"
    "#F472B6",
  ];
  // 100% é mais especial
  const intensidade = marco === 100 ? "alta" : marco === 50 ? "media" : "baixa";
  disparar(cores, intensidade);

  if (marco === 100) {
    // segundo jato escalonado
    window.setTimeout(() => disparar(cores, "media"), 400);
  }
}
