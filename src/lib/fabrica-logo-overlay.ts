export async function composeLogoOnImage(
  baseImageDataUrl: string,
  logoDataUrl?: string,
  whatsapp?: string,
  instagram?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const base = new Image();
    base.crossOrigin = "anonymous";
    base.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        const cw = base.naturalWidth;
        const ch = base.naturalHeight;
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas 2D não suportado"));
        ctx.drawImage(base, 0, 0);

        // Somente desenha o rodapé se tiver alguma informação pra mostrar
        if (logoDataUrl || whatsapp || instagram) {
          const isStory = ch > cw;
          const footerHeight = isStory ? 180 : 120;
          const footerY = ch - footerHeight;

          // Fundo escuro semitransparente para o rodapé inteiro
          ctx.fillStyle = "rgba(0,0,0,0.65)";
          ctx.fillRect(0, footerY, cw, footerHeight);

          // Margens
          const padX = 60;
          let currentX = padX;

          // 1. Logo (Esquerda)
          if (logoDataUrl) {
            const logo = new Image();
            logo.crossOrigin = "anonymous";
            await new Promise((res, rej) => {
              logo.onload = res;
              logo.onerror = rej;
              logo.src = logoDataUrl;
            });
            const maxLogoH = footerHeight * 0.7;
            const maxLogoW = cw * 0.3;
            const ratio = logo.naturalWidth / logo.naturalHeight;
            let lh = maxLogoH;
            let lw = lh * ratio;
            if (lw > maxLogoW) {
              lw = maxLogoW;
              lh = lw / ratio;
            }
            const ly = footerY + (footerHeight - lh) / 2;
            
            // Fundo branco arredondado para a logo se destacar
            ctx.fillStyle = "rgba(255,255,255,0.95)";
            const bgPad = 12;
            ctx.beginPath();
            ctx.roundRect(currentX - bgPad, ly - bgPad, lw + bgPad*2, lh + bgPad*2, 12);
            ctx.fill();

            ctx.drawImage(logo, currentX, ly, lw, lh);
            currentX += lw + bgPad*2 + 40; // espaço após a logo
          }

          // Textos à direita (ou ao lado)
          ctx.fillStyle = "#ffffff";
          ctx.font = `600 ${isStory ? 38 : 32}px Inter, sans-serif`;
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";

          let textRightX = cw - padX;

          if (whatsapp) {
            const text = `WhatsApp: ${whatsapp}`;
            ctx.fillText(text, textRightX, footerY + footerHeight * 0.35);
          }
          if (instagram) {
            const text = `Instagram: @${instagram}`;
            ctx.fillText(text, textRightX, footerY + footerHeight * 0.7);
          }
        }

        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        reject(e);
      }
    };
    base.onerror = () => reject(new Error("Falha ao carregar imagem base"));
    base.src = baseImageDataUrl;
  });
}
