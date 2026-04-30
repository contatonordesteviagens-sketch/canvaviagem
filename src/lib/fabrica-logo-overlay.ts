/**
 * Compõe a logo do usuário sobre a imagem gerada pela IA.
 * Posiciona no canto superior esquerdo, com proporção segura,
 * dentro da safe-zone (8% padding).
 */
export async function composeLogoOnImage(
  baseImageDataUrl: string,
  logoDataUrl: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const base = new Image();
    base.crossOrigin = "anonymous";
    base.onload = () => {
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      logo.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = base.naturalWidth;
          canvas.height = base.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas 2D não suportado"));
          ctx.drawImage(base, 0, 0);

          // Logo dentro da safe-zone do Instagram (top ~14% Stories, ~11% Square).
          // Largura máxima 18% do menor lado pra não competir com a foto/headline.
          const minSide = Math.min(canvas.width, canvas.height);
          const isStory = canvas.height > canvas.width;
          const maxLogoW = minSide * 0.18;
          const maxLogoH = minSide * 0.10;
          const ratio = logo.naturalWidth / logo.naturalHeight;
          let lw = maxLogoW;
          let lh = lw / ratio;
          if (lh > maxLogoH) {
            lh = maxLogoH;
            lw = lh * ratio;
          }
          const padX = canvas.width * 0.07; // 7% lateral — bate com safe lateral do composeTravelAd
          const padY = isStory ? canvas.height * 0.06 : canvas.height * 0.04;

          // Reserva uma área opaca maior que a logo para cobrir qualquer badge/texto que a IA/canvas
          // tenha tentado colocar no canto superior esquerdo. Isso evita "logo em cima do local".
          const bgPad = lw * 0.12;
          const reservedW = lw + bgPad * 2;
          const reservedH = lh + bgPad * 2;
          ctx.save();
          ctx.fillStyle = "rgba(255,255,255,0.96)";
          const r = bgPad;
          const bx = padX - bgPad;
          const by = padY - bgPad;
          const bw = reservedW;
          const bh = reservedH;
          ctx.beginPath();
          ctx.moveTo(bx + r, by);
          ctx.lineTo(bx + bw - r, by);
          ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
          ctx.lineTo(bx + bw, by + bh - r);
          ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
          ctx.lineTo(bx + r, by + bh);
          ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
          ctx.lineTo(bx, by + r);
          ctx.quadraticCurveTo(bx, by, bx + r, by);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          ctx.drawImage(logo, padX, padY, lw, lh);
          resolve(canvas.toDataURL("image/png"));
        } catch (e) {
          reject(e);
        }
      };
      logo.onerror = () => reject(new Error("Falha ao carregar logo"));
      logo.src = logoDataUrl;
    };
    base.onerror = () => reject(new Error("Falha ao carregar imagem base"));
    base.src = baseImageDataUrl;
  });
}
