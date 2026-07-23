import type { Progresso, ProgressoTema } from "./tipos";

const CHAVE = "curioso:progresso:v1";

export function carregarProgresso(): Progresso {
  if (typeof window === "undefined") return {};
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return {};
    const parsed = JSON.parse(bruto);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Progresso;
  } catch {
    return {};
  }
}

export function salvarProgresso(progresso: Progresso): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(progresso));
  } catch {
    // silencioso: localStorage pode estar indisponível
  }
}

export function progressoVazio(): ProgressoTema {
  return { vistas: [], jaSabia: [], favoritos: [] };
}
