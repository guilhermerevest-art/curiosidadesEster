interface BarraProgressoProps {
  atual: number;
  total: number;
  cor: string;
  etiqueta?: string;
}

export function BarraProgresso({
  atual,
  total,
  cor,
  etiqueta,
}: BarraProgressoProps) {
  const percentual = total > 0 ? Math.min(100, (atual / total) * 100) : 0;
  return (
    <div className="w-full">
      {etiqueta && (
        <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
          <span>{etiqueta}</span>
          <span className="font-medium tabular-nums">
            {atual}/{total}
          </span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${percentual}%`, backgroundColor: cor }}
          role="progressbar"
          aria-valuenow={atual}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>
    </div>
  );
}
