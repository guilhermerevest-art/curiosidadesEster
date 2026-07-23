import { Award } from "lucide-react";

interface SeloConquistaProps {
  cor: string;
  texto?: string;
}

export function SeloConquista({ cor, texto = "Mestre" }: SeloConquistaProps) {
  return (
    <div
      className="selo-brilho inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
      style={{
        background: `linear-gradient(135deg, ${cor}33, #FBBF2440)`,
        border: `1px solid ${cor}66`,
        color: "#FBBF24",
      }}
    >
      <Award className="w-3.5 h-3.5" />
      {texto}
    </div>
  );
}
