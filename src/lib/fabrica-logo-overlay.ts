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

          // CRITICAL: a logo precisa caber DENTRO da reserva de topo do composeTravelAd
          // (logoH ≈ 130px no canvas-base de 1080). Senão o box branco invade o badge
          // "Saindo de ..." e o título. Trabalhamos em proporção do canvas real.
          const baseRef = 1080; // composeTravelAd usa esta base p/ logoH=130
          const reserveH = Math.round((130 / baseRef) * canvas.width); // ~130 num 1080
          const padY = Math.round(reserveH * 0.12); // pequeno respiro do topo
          const padX = Math.round(canvas.width * 0.06);
          const maxLogoH = reserveH - padY * 2; // garante ficar dentro da reserva
          const maxLogoW = Math.min(canvas.width * 0.22, reserveH * 2.4);
          const ratio = logo.naturalWidth / logo.naturalHeight;
          let lh = maxLogoH;
          let lw = lh * ratio;
          if (lw > maxLogoW) {
            lw = maxLogoW;
            lh = lw / ratio;
          }

          // Reserva uma área opaca maior que a logo para cobrir qualquer badge/texto que a IA/canvas
          // tenha tentado colocar no canto superior esquerdo. Isso evita "logo em cima do local".
          const bgPad = lw * 0.05;
          ctx.save();
          ctx.fillStyle = "rgba(255,255,255,0.96)";
          const r = bgPad;
          const bx = padX - bgPad;
          const by = padY - bgPad;
          const bw = lw + bgPad * 2;
          const bh = lh + bgPad * 2;
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
