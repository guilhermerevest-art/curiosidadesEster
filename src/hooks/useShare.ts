import { useCallback, useState } from "react";

interface UseShare {
  compartilhado: boolean;
  copiado: boolean;
  compartilharTexto: (texto: string, titulo?: string) => Promise<void>;
  compartilharArquivo: (arquivo: File, titulo?: string, texto?: string) => Promise<void>;
}

function podeCompartilharArquivo(arquivo: File): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.canShare !== "function") return false;
  try {
    return navigator.canShare({ files: [arquivo] });
  } catch {
    return false;
  }
}

export function useShare(): UseShare {
  const [compartilhado, setCompartilhado] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const sinalizar = useCallback((sucesso: boolean) => {
    if (sucesso) {
      setCompartilhado(true);
      window.setTimeout(() => setCompartilhado(false), 2000);
    } else {
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    }
  }, []);

  const compartilharTexto = useCallback(
    async (texto: string, titulo = "Curioso") => {
      if (typeof navigator === "undefined") return;
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ title: titulo, text: texto });
          sinalizar(true);
          return;
        } catch (err) {
          if ((err as { name?: string })?.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.writeText(texto);
        sinalizar(false);
      } catch {
        // silencioso
      }
    },
    [sinalizar],
  );

  const compartilharArquivo = useCallback(
    async (arquivo: File, titulo = "Curioso", texto?: string) => {
      if (typeof navigator === "undefined") return;
      if (podeCompartilharArquivo(arquivo) && typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: titulo,
            text: texto,
            files: [arquivo],
          });
          sinalizar(true);
          return;
        } catch (err) {
          if ((err as { name?: string })?.name === "AbortError") return;
        }
      }
      // fallback: baixar a imagem
      try {
        const url = URL.createObjectURL(arquivo);
        const a = document.createElement("a");
        a.href = url;
        a.download = arquivo.name || "curioso.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        sinalizar(false);
      } catch {
        // silencioso
      }
    },
    [sinalizar],
  );

  return { compartilhado, copiado, compartilharTexto, compartilharArquivo };
}
