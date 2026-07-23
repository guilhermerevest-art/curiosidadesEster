import type { Tema } from "../lib/tipos";

interface ChipTemaProps {
  tema: Tema;
}

export function ChipTema({ tema }: ChipTemaProps) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold text-white"
      style={{
        backgroundColor: tema.cor,
        borderColor: tema.cor,
      }}
    >
      <span aria-hidden className="text-base">
        {tema.emoji}
      </span>
      <span>{tema.nome}</span>
    </div>
  );
}
