import { useEffect, useState } from "react";

const CHAVE = "curioso:streak:v1";

interface StreakSalvo {
  atual: number;
  ultimoAcesso: string; // ISO local date YYYY-MM-DD
  melhor: number;
}

function dataLocalISO(d = new Date()): string {
  // en-CA dá YYYY-MM-DD consistente em qualquer navegador
  return d.toLocaleDateString("en-CA");
}

function diferencaDias(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((da - db) / 86_400_000);
}

function vazio(): StreakSalvo {
  return { atual: 0, ultimoAcesso: "", melhor: 0 };
}

export function carregarStreak(): StreakSalvo {
  if (typeof window === "undefined") return vazio();
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return vazio();
    const parsed = JSON.parse(bruto);
    if (typeof parsed?.atual !== "number") return vazio();
    return parsed as StreakSalvo;
  } catch {
    return vazio();
  }
}

export function salvarStreak(s: StreakSalvo) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(s));
  } catch {
    // silencioso
  }
}

export interface StreakHook {
  atual: number;
  melhor: number;
  registradoAgora: boolean;
}

export function useStreak(): StreakHook {
  const [s, setS] = useState<StreakSalvo>(() => carregarStreak());
  const [registradoAgora, setRegistradoAgora] = useState(false);

  useEffect(() => {
    const hoje = dataLocalISO();
    const atual = carregarStreak();
    if (atual.ultimoAcesso === hoje) {
      setS(atual);
      setRegistradoAgora(false);
      return;
    }
    const diff = atual.ultimoAcesso
      ? diferencaDias(hoje, atual.ultimoAcesso)
      : 0;
    let novoAtual: number;
    if (!atual.ultimoAcesso) novoAtual = 1;
    else if (diff === 1) novoAtual = atual.atual + 1;
    else novoAtual = 1;
    const novoMelhor = Math.max(atual.melhor, novoAtual);
    const proximo: StreakSalvo = {
      atual: novoAtual,
      ultimoAcesso: hoje,
      melhor: novoMelhor,
    };
    salvarStreak(proximo);
    setS(proximo);
    setRegistradoAgora(true);
  }, []);

  return { atual: s.atual, melhor: s.melhor, registradoAgora };
}
