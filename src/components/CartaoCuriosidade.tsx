import type { Curiosidade, Tema } from "../lib/tipos";
import { ChipTema } from "./ChipTema";
import { PipDificuldade } from "./PipDificuldade";
import { Particulas } from "./Particulas";

interface CartaoCuriosidadeProps {
  tema: Tema;
  curiosidade: Curiosidade;
  numeroAtual: number; // 1-based, "Curiosidade #13"
  total: number;
  direcao: "next" | "prev" | null;
  estado: "entrando" | "saindo";
}

const TAMANHO_GRUPO = 6;

function agruparPalavras(texto: string): string[] {
  const palavras = texto.split(/(\s+)/);
  const grupos: string[] = [];
  let atual: string[] = [];
  let cont = 0;
  for (const p of palavras) {
    if (/\s+/.test(p)) {
      atual.push(p);
      continue;
    }
    atual.push(p);
    cont += 1;
    if (cont >= TAMANHO_GRUPO) {
      grupos.push(atual.join(""));
      atual = [];
      cont = 0;
    }
  }
  if (atual.length > 0) grupos.push(atual.join(""));
  return grupos;
}

export function CartaoCuriosidade({
  tema,
  curiosidade,
  numeroAtual,
  total,
  estado,
}: CartaoCuriosidadeProps) {
  const grupos = agruparPalavras(curiosidade.texto);
  const classeEstado =
    estado === "entrando" ? "card-next-in" : "card-next opacity-0";

  return (
    <article
      className={[
        "cartao-3d cartao-tema relative w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl",
        "transition-shadow",
        classeEstado,
      ].join(" ")}
      style={
        {
          ["--tema-cor" as never]: tema.cor,
          boxShadow: `0 24px 60px -20px ${tema.cor}40, 0 4px 12px rgba(0,0,0,0.25)`,
        } as React.CSSProperties
      }
    >
      <div className="face relative">
        <Particulas cor={tema.cor} quantidade={7} />
        <div className="relative z-10 flex items-center justify-between mb-5 gap-3">
          <ChipTema tema={tema} />
          <PipDificuldade nivel={curiosidade.nivel} cor={tema.cor} />
        </div>
        <p
          className="relative z-10 text-[11px] font-medium uppercase tracking-[0.14em] texto-suave mb-3"
          aria-label={`Curiosidade ${numeroAtual} de ${total}`}
        >
          Curiosidade #{numeroAtual} de {total} · {tema.nome}
        </p>
        <p className="relative z-10 curiosity-text text-balance text-[1.25rem] sm:text-[1.45rem] leading-[1.45]">
          {grupos.map((g, i) => (
            <span
              key={`${curiosidade.id}-${i}`}
              className="reveal-line"
              style={{ ["--i" as never]: i }}
            >
              {g}
            </span>
          ))}
        </p>
      </div>
    </article>
  );
}
