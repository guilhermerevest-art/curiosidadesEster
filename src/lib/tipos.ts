export type Nivel = "facil" | "medio" | "dificil";

export interface Tema {
  id: string;
  nome: string;
  emoji: string;
  cor: string;
  descricao: string;
}

export interface Curiosidade {
  id: string;
  temaId: string;
  texto: string;
  nivel: Nivel;
}

export interface ProgressoTema {
  vistas: string[];
  jaSabia: string[];
  favoritos: string[];
}

export type Progresso = Record<string, ProgressoTema>;
