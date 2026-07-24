import { useCallback, useEffect, useState } from "react";

const CHAVE = "curioso:push:opt-in:v1";

type Estado = "default" | "granted" | "denied" | "unsupported";

export function useNotificacoes() {
  const [estado, setEstado] = useState<Estado>("default");
  const [optIn, setOptIn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(CHAVE) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof Notification === "undefined") {
      setEstado("unsupported");
      return;
    }
    setEstado(Notification.permission as Estado);
  }, []);

  const pedir = useCallback(async () => {
    if (typeof Notification === "undefined") return false;
    if (Notification.permission === "granted") {
      setOptIn(true);
      try {
        window.localStorage.setItem(CHAVE, "1");
      } catch {
        // silencioso
      }
      return true;
    }
    const r = await Notification.requestPermission();
    setEstado(r as Estado);
    if (r === "granted") {
      setOptIn(true);
      try {
        window.localStorage.setItem(CHAVE, "1");
      } catch {
        // silencioso
      }
      return true;
    }
    return false;
  }, []);

  const desativar = useCallback(() => {
    setOptIn(false);
    try {
      window.localStorage.setItem(CHAVE, "0");
    } catch {
      // silencioso
    }
  }, []);

  return { estado, optIn, pedir, desativar };
}
