interface PullToRefreshIndicatorProps {
  progresso: number; // 0..1
  carregando: boolean;
  cor: string;
}

export function PullToRefreshIndicator({
  progresso,
  carregando,
  cor,
}: PullToRefreshIndicatorProps) {
  const rotacao = Math.min(360, progresso * 360);
  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-all duration-200"
      style={{ height: carregando ? 64 : Math.min(48, 8 + progresso * 40) }}
      aria-hidden={!carregando}
    >
      <div
        className="rounded-full border-2 border-t-transparent transition-transform"
        style={{
          width: 28,
          height: 28,
          borderColor: `${cor} transparent transparent transparent`,
          transform: `rotate(${carregando ? "9999s linear infinite" : `${rotacao}deg`})`,
          animation: carregando ? "ptrSpin 0.9s linear infinite" : undefined,
        }}
      />
    </div>
  );
}
