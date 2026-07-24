import type { Curiosidade, Tema } from "./tipos";

interface RenderArgs {
  curiosidade: Curiosidade;
  tema: Tema;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const palavras = text.split(/\s+/);
  const linhas: string[] = [];
  let atual = "";
  for (const p of palavras) {
    const teste = atual ? `${atual} ${p}` : p;
    if (ctx.measureText(teste).width > maxWidth && atual) {
      linhas.push(atual);
      atual = p;
    } else {
      atual = teste;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

async function carregarFonte(familia: string, peso: number, italico: boolean): Promise<void> {
  if (typeof document === "undefined") return;
  // tenta carregar do Google Fonts via FontFace API
  const ital = italico ? "1" : "0";
  const url = `https://fonts.googleapis.com/css2?family=${familia.replace(/ /g, "+")}:wght@${peso}&ital=${ital}`;
  try {
    const cssText = await fetch(url, { mode: "cors" })
      .then((r) => r.text())
      .catch(() => "");
    const match = cssText.match(/src:\s*url\(([^)]+)\)\s+format\([^)]+\)/);
    if (!match) return;
    const fontUrl = match[1];
    if (!fontUrl) return;
    const font = new FontFace(familia, `url(${fontUrl})`);
    await font.load();
    (document as Document & { fonts?: { add: (f: FontFace) => void } }).fonts?.add(font);
  } catch {
    // silencioso: cai na fonte do sistema
  }
}

export async function renderStoryCard({ curiosidade, tema }: RenderArgs): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado");

  // tenta carregar fontes (best effort)
  await Promise.all([
    carregarFonte("Fraunces", 600, false),
    carregarFonte("Inter", 500, false),
  ]);

  // fundo gradiente do tema
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, tema.cor);
  grad.addColorStop(1, "#0F172A");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // vinheta sutil
  const vignette = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, H * 0.7);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  // chip do tema
  ctx.font = "600 38px Inter, sans-serif";
  const chipTexto = `${tema.emoji}  ${tema.nome.toUpperCase()}`;
  const chipLargura = ctx.measureText(chipTexto).width + 60;
  const chipX = (W - chipLargura) / 2;
  const chipY = 240;
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  roundRect(ctx, chipX, chipY, chipLargura, 84, 42);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "middle";
  ctx.fillText(chipTexto, chipX + 30, chipY + 42);

  // texto da curiosidade
  ctx.font = "600 78px Fraunces, Georgia, serif";
  ctx.fillStyle = "#F8FAFC";
  ctx.textBaseline = "alphabetic";
  const maxWidth = W - 200;
  const linhas = wrapText(ctx, curiosidade.texto, maxWidth);
  const lineHeight = 96;
  const totalH = linhas.length * lineHeight;
  let y = (H - totalH) / 2 + lineHeight * 0.6;
  for (const ln of linhas) {
    const x = (W - ctx.measureText(ln).width) / 2;
    ctx.fillText(ln, x, y);
    y += lineHeight;
  }

  // rodapé com branding
  ctx.font = "500 36px Inter, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.textAlign = "center";
  ctx.fillText("Curioso", W / 2, H - 140);
  ctx.font = "400 24px Inter, sans-serif";
  ctx.fillText("curiosidades app", W / 2, H - 100);
  ctx.textAlign = "left";

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Falha ao gerar imagem"))),
      "image/png",
      0.92,
    );
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
