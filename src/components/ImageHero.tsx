import { useState } from "react";

interface ImageHeroProps {
  src: string;
  alt: string;
  altura?: number;
  paralax?: number; // 0..1 deslocamento lateral
}

export function ImageHero({ src, alt, altura = 180, paralax = 0 }: ImageHeroProps) {
  const [carregou, setCarregou] = useState(false);
  const [erro, setErro] = useState(false);
  if (erro) return null;
  return (
    <div
      className="relative w-full overflow-hidden bg-black/10"
      style={{ height: altura }}
    >
      {!carregou && (
        <div className="absolute inset-0 animate-pulse bg-white/5" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setCarregou(true)}
        onError={() => setErro(true)}
        className="h-full w-full object-cover transition-opacity duration-500"
        style={{
          opacity: carregou ? 1 : 0,
          transform: `translateX(${paralax * 30}px) scale(1.05)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </div>
  );
}
