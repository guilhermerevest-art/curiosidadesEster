import { useCallback, useEffect, useState } from "react";

export type TemaModo = "light" | "dark" | "auto";

const CHAVE = "curioso:modo-tema:v1";

function detectarInicial(): TemaModo {
  if (typeof window === "undefined") return "auto";
  try {
    const salvo = window.localStorage.getItem(CHAVE);
    if (salvo === "light" || salvo === "dark" || salvo === "auto") return salvo;
  } catch {
    // silencioso
  }
  return "auto";
}

function resolverAtual(modo: TemaModo): "light" | "dark" {
  if (modo === "auto") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  return modo;
}

function aplicarNoDom(tema: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = tema;
}

export function useTema() {
  const [modo, setModo] = useState<TemaModo>(detectarInicial);
  const [atual, setAtual] = useState<"light" | "dark">(() =>
    resolverAtual(detectarInicial()),
  );

  // Persistir e aplicar quando o modo muda
  useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE, modo);
    } catch {
      // silencioso
    }
    const resolvido = resolverAtual(modo);
    setAtual(resolvido);
    aplicarNoDom(resolvido);
  }, [modo]);

  // Reagir a mudanças do SO quando o modo é "auto"
  useEffect(() => {
    if (modo !== "auto") return;
    const mq = window.matchMedia?.("(prefers-color-scheme: light)");
    if (!mq) return;
    const handler = () => {
      const r = resolverAtual("auto");
      setAtual(r);
      aplicarNoDom(r);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [modo]);

  const alternar = useCallback(() => {
    setModo((m) => {
      // ciclo: auto -> light -> dark -> auto
      if (m === "auto") return "light";
      if (m === "light") return "dark";
      return "auto";
    });
  }, []);

  return { modo, atual, alternar };
}
