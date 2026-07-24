import { useEffect, useState } from "react";

export interface DeepLink {
  acao?: "hoje" | "favoritos" | "temas" | "tema" | "historico";
  temaId?: string;
  curiosidadeId?: string;
}

function parse(): DeepLink {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  const dl: DeepLink = {};
  const acao = p.get("acao");
  if (acao === "hoje" || acao === "favoritos" || acao === "temas" || acao === "tema" || acao === "historico") {
    dl.acao = acao;
  }
  const tema = p.get("tema");
  if (tema) dl.temaId = tema;
  const cur = p.get("c");
  if (cur) dl.curiosidadeId = cur;
  return dl;
}

export function useDeepLink(): DeepLink {
  const [dl, setDl] = useState<DeepLink>(parse);
  useEffect(() => {
    function onPop() {
      setDl(parse());
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return dl;
}
