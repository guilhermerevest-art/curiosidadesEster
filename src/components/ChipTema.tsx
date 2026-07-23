import type { Tema } from "../lib/tipos";

interface ChipTemaProps {
  tema: Tema;
}

export function ChipTema({ tema }: ChipTemaProps) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium"
      style={{
        backgroundColor: `${tema.cor}1F`,
        borderColor: `${tema.cor}55`,
        color: tema.cor,
      }}
    >
      <span aria-hidden className="text-base">
        {tema.emoji}
      </span>
      <span>{tema.nome}</span>
    </div>
  );
}
