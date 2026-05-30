commit 5fb09f667d538deb25a52fe2095cb66c7756cc20
Author: contatonordesteviagens-sketch <contatonordesteviagens@gmail.com>
Date:   Mon May 18 12:37:14 2026 -0300

    fix(fabrica): corrige V0 - icones dos beneficios renderizados graficamente em vez de texto literal

diff --git a/src/lib/fabrica-compose-art.ts b/src/lib/fabrica-compose-art.ts
index 5a0cc95..75c7bf0 100644
--- a/src/lib/fabrica-compose-art.ts
+++ b/src/lib/fabrica-compose-art.ts
@@ -1958,20 +1958,24 @@ const panelBottom = RULES.PANEL_BOTTOM;
       const benefitsMaxW = priceX - 24 - benefitsX;
 
       ctx.fillStyle = v0OnPanel;
-      ctx.font = "700 26px Inter, Arial, sans-serif";
-      const iconForIndex = (i: number, fallback: string) =>
-        ICON_SYMBOL[(benefitsList[i]?.icon as IconKey) || (fallback as IconKey)] || ICON_SYMBOL.check;
+      const iconSize0 = 28;
+      const iconTextGap = 42; // espa├ºo reservado para o ├¡cone + margem
       benefitsList.forEach((b, i) => {
-        const icon = iconForIndex(i, ["bus", "map", "guide", "star"][i] || "check");
-        const line = `${icon} ${b.text}`;
-        // auto-shrink por linha pra caber na coluna esquerda
+        const iconKey = (b.icon as IconKey) || (["bus", "map", "guide", "star"][i] as IconKey) || "check";
+        const lineY = rowTopY + 28 + i * benefitLineH;
+        // Desenha ├¡cone gr├ífico
+        drawMonoIcon(ctx, iconKey, benefitsX + iconSize0 / 2, lineY - iconSize0 * 0.25, iconSize0, v0OnPanel);
+        // Texto ao lado do ├¡cone, com auto-shrink
         let bfs = 26;
         ctx.font = `700 ${bfs}px Inter, Arial, sans-serif`;
-        while (ctx.measureText(line).width > benefitsMaxW && bfs > 16) {
+        const textMaxW = benefitsMaxW - iconTextGap;
+        while (ctx.measureText(b.text).width > textMaxW && bfs > 16) {
           bfs -= 2;
           ctx.font = `700 ${bfs}px Inter, Arial, sans-serif`;
         }
-        ctx.fillText(line, benefitsX, rowTopY + 28 + i * benefitLineH);
+        ctx.textBaseline = "middle";
+        safeFillText(ctx, b.text, benefitsX + iconTextGap, lineY - benefitLineH * 0.1, textMaxW, 14);
+        ctx.textBaseline = "alphabetic";
       });
 
       // Divisor vertical
