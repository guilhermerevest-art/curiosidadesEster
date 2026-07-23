import type { Nivel } from "../lib/tipos";

interface PipDificuldadeProps {
  nivel: Nivel;
  cor: string;
}

const ROTULO: Record<Nivel, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

const PREENCHIDOS: Record<Nivel, number> = {
  facil: 1,
  medio: 2,
  dificil: 3,
};

export function PipDificuldade({ nivel, cor }: PipDificuldadeProps) {
  const preenchidos = PREENCHIDOS[nivel];
  return (
    <div
      className="inline-flex items-center gap-1.5"
      role="img"
      aria-label={`Dificuldade ${ROTULO[nivel]}`}
    >
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1.5 w-4 rounded-full"
            style={{
              backgroundColor: i <= preenchidos ? cor : "currentColor",
              opacity: i <= preenchidos ? 1 : 0.25,
            }}
          />
        ))}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider texto-suave">
        {ROTULO[nivel]}
      </span>
    </div>
  );
}
