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

        if (logoDataUrl || whatsapp || instagram) {
          const isStory = ch > cw;
          // Margem de segurança para Stories (280px na base para não cobrir UI do Insta)
          const safeBottomMargin = isStory ? 280 : 0;
          const footerHeight = isStory ? 160 : 110;
          const footerY = ch - footerHeight - safeBottomMargin;

          // 1. Fundo do Rodapé (VÉU SEMITRANSPARENTE)
          const grad = ctx.createLinearGradient(0, footerY, 0, ch);
          grad.addColorStop(0, "rgba(0,0,0,0.0)"); // Começa totalmente transparente
          grad.addColorStop(0.5, "rgba(0,0,0,0.4)"); // Véu sutil no meio
          grad.addColorStop(1, "rgba(0,0,0,0.7)");   // Um pouco mais escuro na base para legibilidade
          ctx.fillStyle = grad;
          ctx.fillRect(0, footerY, cw, footerHeight);

          const padX = 50;
          const centerY = footerY + footerHeight / 2;

          // Função para formatar telefone: (XX) 9 XXXX-XXXX
          const formatPhone = (val: string) => {
            const d = val.replace(/\D/g, "");
            if (d.length === 11) {
              return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
            }
            if (d.length === 10) {
              return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
            }
            return val; // fallback
          };

          // 2. Logo (Esquerda)
          if (logoDataUrl) {
            const logo = new Image();
            logo.crossOrigin = "anonymous";
            await new Promise((res, rej) => {
              logo.onload = res;
              logo.onerror = rej;
              logo.src = logoDataUrl;
            });
            const maxLogoH = footerHeight * 0.75;
            const maxLogoW = cw * 0.35;
            const ratio = logo.naturalWidth / logo.naturalHeight;
            let lh = maxLogoH;
            let lw = lh * ratio;
            if (lw > maxLogoW) {
              lw = maxLogoW;
              lh = lw / ratio;
            }
            
            // Box da Logo
            const bgPad = 16;
            ctx.fillStyle = "rgba(255,255,255,1)";
            ctx.shadowColor = "rgba(0,0,0,0.4)";
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.roundRect(padX, centerY - lh / 2 - bgPad, lw + bgPad * 2, lh + bgPad * 2, 16);
            ctx.fill();
            ctx.shadowBlur = 0; 

            ctx.drawImage(logo, padX + bgPad, centerY - lh / 2, lw, lh);
          }

          // 3. Info de Contato (Direita)
          ctx.textAlign = "right";
          ctx.textBaseline = "middle";
          const fontSize = isStory ? 38 : 32;
          ctx.font = `700 ${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = "#ffffff";

          let textRightX = cw - 60;

          const drawWhatsAppIcon = (x: number, y: number, size: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.shadowColor = "rgba(0,0,0,0.25)";
            ctx.shadowBlur = 4;

            // Fundo Verde Oficial do WhatsApp
            ctx.fillStyle = "#25D366";
            ctx.beginPath(); 
            ctx.arc(0, 0, size * 0.48, 0, Math.PI * 2); 
            ctx.fill();
            
            // Balão Branco
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(0, -size * 0.02, size * 0.4, 0.7, 5.5);
            ctx.lineTo(-size * 0.35, size * 0.45);
            ctx.closePath();
            ctx.fill();

            // Fone Verde - Desenho em Vetor de Alta Fidelidade (Curvado Oficial do WhatsApp)
            ctx.fillStyle = "#25D366";
            ctx.strokeStyle = "#25D366";
            ctx.lineWidth = size * 0.10;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            
            ctx.beginPath();
            ctx.arc(0, -size * 0.02, size * 0.20, 0.7, 2.4);
            ctx.stroke();
            
            // Almofadas curvas do fone (microfone e fone de ouvido do logo do WhatsApp)
            ctx.save();
            ctx.translate(0, -size * 0.02);
            ctx.rotate(0.65);
            ctx.beginPath();
            ctx.ellipse(size * 0.20, 0, size * 0.07, size * 0.11, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            ctx.save();
            ctx.translate(0, -size * 0.02);
            ctx.rotate(2.45);
            ctx.beginPath();
            ctx.ellipse(size * 0.20, 0, size * 0.07, size * 0.11, 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.restore();
          };

          const drawInstagramIcon = (x: number, y: number, size: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.shadowColor = "rgba(0,0,0,0.4)";
            ctx.shadowBlur = 5;
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size/2);
            g.addColorStop(0, "#f09433");
            g.addColorStop(0.25, "#e6683c");
            g.addColorStop(0.5, "#dc2743");
            g.addColorStop(0.75, "#cc2366");
            g.addColorStop(1, "#bc1888");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.roundRect(-size/2, -size/2, size, size, size*0.2);
            ctx.fill();
            ctx.strokeStyle = "white";
            ctx.lineWidth = size * 0.08;
            ctx.strokeRect(-size*0.3, -size*0.3, size*0.6, size*0.6);
            ctx.beginPath();
            ctx.arc(0, 0, size*0.15, 0, Math.PI*2);
            ctx.stroke();
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(size*0.18, -size*0.18, size*0.04, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
          };

          const iconSize = fontSize * 1.1;
          const itemGap = 15;

          if (instagram) {
            const handle = instagram.startsWith("@") ? instagram : `@${instagram}`;
            const yPos = whatsapp ? centerY + (footerHeight * 0.18) : centerY;
            ctx.fillText(handle, textRightX, yPos);
            const textWidth = ctx.measureText(handle).width;
            drawInstagramIcon(textRightX - textWidth - itemGap - iconSize/2, yPos, iconSize);
          }

          if (whatsapp) {
            const num = formatPhone(whatsapp);
            const yPos = instagram ? centerY - (footerHeight * 0.18) : centerY;
            ctx.fillText(num, textRightX, yPos);
            const textWidth = ctx.measureText(num).width;
            drawWhatsAppIcon(textRightX - textWidth - itemGap - iconSize/2, yPos, iconSize);
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
