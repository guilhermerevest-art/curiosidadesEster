export interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  icone: string; // emoji
}

export const CATALOGO: Conquista[] = [
  { id: "primeira", titulo: "Primeira descoberta", descricao: "Viu sua primeira curiosidade.", icone: "🌱" },
  { id: "vistas-10", titulo: "Curioso iniciante", descricao: "Viu 10 curiosidades.", icone: "🔎" },
  { id: "vistas-50", titulo: "Aprendiz", descricao: "Viu 50 curiosidades.", icone: "📚" },
  { id: "vistas-100", titulo: "Estudioso", descricao: "Viu 100 curiosidades.", icone: "🎓" },
  { id: "vistas-250", titulo: "Sábio", descricao: "Viu 250 curiosidades.", icone: "🧠" },
  { id: "vistas-500", titulo: "Mestre das curiosidades", descricao: "Viu 500 curiosidades.", icone: "🏆" },
  { id: "favoritos-5", titulo: "Colecionador", descricao: "Tem 5 favoritos.", icone: "💖" },
  { id: "favoritos-25", titulo: "Curador", descricao: "Tem 25 favoritos.", icone: "⭐" },
  { id: "streak-3", titulo: "3 dias seguidos", descricao: "Fechou 3 dias seguidos.", icone: "🔥" },
  { id: "streak-7", titulo: "Uma semana!", descricao: "Fechou 7 dias seguidos.", icone: "🌟" },
  { id: "streak-30", titulo: "Vício saudável", descricao: "Fechou 30 dias seguidos.", icone: "💎" },
];

export interface EstadoConquistas {
  totalVistas: number;
  totalFavoritos: number;
  streakAtual: number;
  // mapa: temaId -> {vistas, total, completo}
  porTema: Record<string, { vistas: number; total: number }>;
}

export function idParaTema(temaId: string): string {
  return `tema-completo:${temaId}`;
}

export function conquistaDeTema(temaId: string): Conquista {
  return {
    id: idParaTema(temaId),
    titulo: `Mestre em ${temaNomePorId(temaId)}`,
    descricao: `Viu todas as 50 curiosidades de ${temaNomePorId(temaId)}.`,
    icone: "🏅",
  };
}

const NOMES_TEMAS: Record<string, string> = {
  espaco: "Espaço",
  corpo: "Corpo Humano",
  animais: "Animais",
  historia: "História",
  ciencia: "Ciência",
  tecnologia: "Tecnologia",
  geografia: "Geografia",
  comida: "Comida e Bebida",
  cultura: "Cinema e Cultura",
  esportes: "Esportes",
  natureza: "Natureza",
  matematica: "Matemática",
};

function temaNomePorId(id: string): string {
  return NOMES_TEMAS[id] ?? id;
}

export function verificar(
  estado: EstadoConquistas,
  temasIds: string[],
): string[] {
  const atingidas = new Set<string>();
  for (const c of CATALOGO) {
    if (c.id === "primeira" && estado.totalVistas >= 1) atingidas.add(c.id);
    if (c.id === "vistas-10" && estado.totalVistas >= 10) atingidas.add(c.id);
    if (c.id === "vistas-50" && estado.totalVistas >= 50) atingidas.add(c.id);
    if (c.id === "vistas-100" && estado.totalVistas >= 100) atingidas.add(c.id);
    if (c.id === "vistas-250" && estado.totalVistas >= 250) atingidas.add(c.id);
    if (c.id === "vistas-500" && estado.totalVistas >= 500) atingidas.add(c.id);
    if (c.id === "favoritos-5" && estado.totalFavoritos >= 5) atingidas.add(c.id);
    if (c.id === "favoritos-25" && estado.totalFavoritos >= 25) atingidas.add(c.id);
    if (c.id === "streak-3" && estado.streakAtual >= 3) atingidas.add(c.id);
    if (c.id === "streak-7" && estado.streakAtual >= 7) atingidas.add(c.id);
    if (c.id === "streak-30" && estado.streakAtual >= 30) atingidas.add(c.id);
  }
  for (const id of temasIds) {
    const t = estado.porTema[id];
    if (t && t.total > 0 && t.vistas >= t.total) {
      atingidas.add(idParaTema(id));
    }
  }
  return Array.from(atingidas);
}

export function catalogoCompleto(temasIds: string[]): Conquista[] {
  return [...CATALOGO, ...temasIds.map((id) => ({
    id: idParaTema(id),
    titulo: `Mestre em ${NOMES_TEMAS[id] ?? id}`,
    descricao: `Viu todas as 50 curiosidades de ${NOMES_TEMAS[id] ?? id}.`,
    icone: "🏅",
  }))];
}
