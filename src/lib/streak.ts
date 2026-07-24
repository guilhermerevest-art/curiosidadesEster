import { useCallback, useEffect, useState } from "react";

const CHAVE = "curioso:streak:v1";

interface StreakSalvo {
  atual: number;
  ultimoAcesso: string; // ISO local date YYYY-MM-DD
  melhor: number;
  escudos: number; // "streak freezes" acumulados
  escudoUsadoEm: string; // ISO date do dia em que foi usado (1 escudo por vez)
}

function dataLocalISO(d = new Date()): string {
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
  return { atual: 0, ultimoAcesso: "", melhor: 0, escudos: 0, escudoUsadoEm: "" };
}

export function carregarStreak(): StreakSalvo {
  if (typeof window === "undefined") return vazio();
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return vazio();
    const parsed = JSON.parse(bruto);
    if (typeof parsed?.atual !== "number") return vazio();
    return {
      atual: parsed.atual,
      ultimoAcesso: parsed.ultimoAcesso ?? "",
      melhor: parsed.melhor ?? 0,
      escudos: parsed.escudos ?? 0,
      escudoUsadoEm: parsed.escudoUsadoEm ?? "",
    } as StreakSalvo;
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
  escudos: number;
  escudoUsado: boolean;
  // ganhou escudo novo? (para animar)
  ganhouEscudo: boolean;
  usarEscudo: () => boolean;
}

export function useStreak(): StreakHook {
  const [s, setS] = useState<StreakSalvo>(() => carregarStreak());
  const [registradoAgora, setRegistradoAgora] = useState(false);
  const [ganhouEscudo, setGanhouEscudo] = useState(false);
  const [escudoUsado, setEscudoUsado] = useState(false);

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
    let novoEscudos = atual.escudos;
    let ganhou = false;

    if (!atual.ultimoAcesso) {
      novoAtual = 1;
    } else if (diff === 1) {
      novoAtual = atual.atual + 1;
    } else {
      // pulou um ou mais dias — usar escudo se disponível
      const podeUsar = atual.escudos > 0 && atual.escudoUsadoEm !== hoje;
      if (podeUsar && diff <= 2) {
        novoAtual = atual.atual + 1; // escudo cobre 1 dia
        novoEscudos = atual.escudos - 1;
        setEscudoUsado(true);
      } else {
        novoAtual = 1;
      }
    }
    // ganha 1 escudo a cada 7 dias consecutivos
    if (novoAtual > 0 && novoAtual % 7 === 0 && novoEscudos === atual.escudos) {
      novoEscudos += 1;
      ganhou = true;
    }
    const novoMelhor = Math.max(atual.melhor, novoAtual);
    const proximo: StreakSalvo = {
      atual: novoAtual,
      ultimoAcesso: hoje,
      melhor: novoMelhor,
      escudos: novoEscudos,
      escudoUsadoEm: escudoUsado ? hoje : atual.escudoUsadoEm,
    };
    salvarStreak(proximo);
    setS(proximo);
    setRegistradoAgora(true);
    if (ganhou) {
      setGanhouEscudo(true);
      window.setTimeout(() => setGanhouEscudo(false), 4000);
    }
  }, []);

  const usarEscudo = useCallback(() => {
    const hoje = dataLocalISO();
    const atual = carregarStreak();
    if (atual.escudos <= 0) return false;
    if (atual.escudoUsadoEm === hoje) return false;
    // se o usuário abre hoje, o streak "usa" o escudo automaticamente
    // se ele quer usar retroativamente, o hook no mount já trata; aqui
    // devolvemos false para sinalizar que não há ação manual
    return false;
  }, []);

  return {
    atual: s.atual,
    melhor: s.melhor,
    registradoAgora,
    escudos: s.escudos,
    escudoUsado,
    ganhouEscudo,
    usarEscudo,
  };
}
