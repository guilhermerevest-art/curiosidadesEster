import { useCallback, useState } from "react";

interface UseShare {
  compartilhado: boolean;
  copiado: boolean;
  compartilhar: (texto: string, titulo?: string) => Promise<void>;
}

export function useShare(): UseShare {
  const [compartilhado, setCompartilhado] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const compartilhar = useCallback(async (texto: string, titulo = "Curioso") => {
    if (typeof navigator === "undefined") return;
    if (typeof navigator.canShare === "function" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: titulo, text: texto });
        setCompartilhado(true);
        window.setTimeout(() => setCompartilhado(false), 2000);
        return;
      } catch (err) {
        // usuário cancelou ou navegador recusou — cai no fallback
        if ((err as { name?: string })?.name === "AbortError") return;
      }
    }
    // Fallback: clipboard
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sem clipboard também: silencioso
    }
  }, []);

  return { compartilhado, copiado, compartilhar };
}
