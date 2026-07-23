import { useMemo } from "react";

export function useSaudacao(): { texto: string; icone: string; hora: number } {
  return useMemo(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return { texto: "Bom dia", icone: "☀️", hora };
    if (hora >= 12 && hora < 18) return { texto: "Boa tarde", icone: "🌤️", hora };
    return { texto: "Boa noite", icone: "🌙", hora };
  }, []);
}
