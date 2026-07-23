import { useMemo, useState } from "react";
import type { Curiosidade } from "./tipos";
import { useCuriosidades } from "../hooks/useCuriosidades";

const CHAVE = "curioso:dia:v1";

interface DiaSalvo {
  data: string; // YYYY-MM-DD
  id: string;
}

function dataLocalISO(d = new Date()): string {
  return d.toLocaleDateString("en-CA");
}

function carregarSalvo(): DiaSalvo | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const parsed = JSON.parse(bruto) as DiaSalvo;
    if (parsed?.data && parsed?.id) return parsed;
    return null;
  } catch {
    return null;
  }
}

function salvarSalvo(d: DiaSalvo) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(d));
  } catch {
    // silencioso
  }
}

// djb2 determinístico: mesmo dia → mesmo índice, em qualquer máquina.
function hashDia(data: string): number {
  let h = 5381;
  for (let i = 0; i < data.length; i++) {
    h = (h * 33) ^ data.charCodeAt(i);
  }
  return Math.abs(h);
}

export function useCuriosidadeDoDia(): Curiosidade {
  const { curiosidades, curiosidadePorId } = useCuriosidades();
  const [salvo, setSalvo] = useState<DiaSalvo | null>(carregarSalvo);
  const hoje = useMemo(() => dataLocalISO(), []);

  return useMemo<Curiosidade>(() => {
    if (curiosidades.length === 0) {
      // fallback extremo: nunca deve acontecer, mas mantém TS feliz
      return {} as Curiosidade;
    }
    if (salvo && salvo.data === hoje) {
      const achou = curiosidadePorId(salvo.id);
      if (achou) return achou;
    }
    const escolhida = curiosidades[hashDia(hoje) % curiosidades.length];
    if (!escolhida) return {} as Curiosidade;
    if (!salvo || salvo.data !== hoje || salvo.id !== escolhida.id) {
      const novo: DiaSalvo = { data: hoje, id: escolhida.id };
      salvarSalvo(novo);
      setSalvo(novo);
    }
    return escolhida;
  }, [curiosidades, curiosidadePorId, salvo, hoje]);
}
