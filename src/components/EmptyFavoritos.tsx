interface EmptyFavoritosProps {
  onExplorar: () => void;
}

export function EmptyFavoritos({ onExplorar }: EmptyFavoritosProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <svg
        width="160"
        height="140"
        viewBox="0 0 160 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-4"
        aria-hidden
      >
        <defs>
          <linearGradient id="gradCoracao" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FB7185" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F472B6" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="gradFolha" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <rect
          x="24"
          y="22"
          width="112"
          height="92"
          rx="14"
          fill="currentColor"
          fillOpacity="0.04"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />
        <path
          d="M80 96s-22-13-22-29a12 12 0 0 1 22-6 12 12 0 0 1 22 6c0 16-22 29-22 29z"
          fill="url(#gradCoracao)"
        />
        <path
          d="M58 110c4 2 8 3 12 3"
          stroke="url(#gradFolha)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M70 116c4 2 10 3 16 2"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="44" cy="44" r="3" fill="currentColor" fillOpacity="0.2" />
        <circle cx="120" cy="56" r="2" fill="currentColor" fillOpacity="0.18" />
        <circle cx="112" cy="38" r="2.5" fill="currentColor" fillOpacity="0.16" />
      </svg>
      <p className="text-base font-semibold text-app">
        Nenhum favorito ainda
      </p>
      <p className="text-sm max-w-xs mt-1 text-app-3">
        Toque no coração das suas curiosidades preferidas e elas vão aparecer
        aqui.
      </p>
      <button
        type="button"
        onClick={onExplorar}
        className="mt-5 px-4 py-2 rounded-full bg-app text-app border border-app-2 hover:border-app-2/80 text-sm font-medium transition"
      >
        Explorar temas
      </button>
    </div>
  );
}
