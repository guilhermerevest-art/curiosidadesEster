# Curioso

App de curiosidades em pt-BR, mobile-first: escolha um tema e descubra uma curiosidade nova a cada toque.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS 3
- lucide-react (ícones)
- Persistência via `localStorage` (sem backend no MVP)

## Estrutura

```text
src/
├── App.tsx                      orquestra as 3 telas
├── data/curiosidades.json       12 temas × 50 = 600 curiosidades
├── lib/                         tipos e storage
├── hooks/                       useCuriosidades, useProgresso
└── components/                  TelaTemas, TelaCuriosidade, TelaFavoritos, ...
```

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
npm run preview  # serve dist/ para checar o build
```

## Adicionar mais curiosidades

Basta acrescentar entradas em `src/data/curiosidades.json` seguindo o padrão:

```json
{ "id": "{temaId}-{3 digitos}", "temaId": "espaco", "texto": "...", "nivel": "facil|medio|dificil" }
```

Nenhuma mudança de código é necessária — o hook `useCuriosidades` lê o JSON em tempo de execução.
