import { Moon, Sun, MonitorSmartphone, Minus, Plus } from "lucide-react";
import { useTema } from "../hooks/useTema";
import { useTamanhoFonte } from "../hooks/useTamanhoFonte";

export function ControlesUI() {
  const { modo, atual, alternar } = useTema();
  const { nivel, diminuir, aumentar } = useTamanhoFonte();

  const IconeTema =
    modo === "auto" ? MonitorSmartphone : atual === "light" ? Moon : Sun;
  const rotuloTema =
    modo === "auto"
      ? "Tema automático (clique para usar tema claro)"
      : atual === "light"
        ? "Tema claro (clique para tema escuro)"
        : "Tema escuro (clique para automático)";

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={diminuir}
        aria-label="Diminuir texto"
        title="Diminuir texto"
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-card border border-app text-app-2 hover:border-app-2 transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span
        className="text-[11px] font-semibold tabular-nums text-app-3 w-4 text-center"
        aria-live="polite"
      >
        {nivel}
      </span>
      <button
        type="button"
        onClick={aumentar}
        aria-label="Aumentar texto"
        title="Aumentar texto"
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-card border border-app text-app-2 hover:border-app-2 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={alternar}
        aria-label={rotuloTema}
        title={rotuloTema}
        className="ml-1 flex items-center justify-center w-9 h-9 rounded-lg bg-card border border-app hover:border-app-2 text-app-2 transition-colors"
      >
        <IconeTema className="w-4 h-4" />
      </button>
    </div>
  );
}
