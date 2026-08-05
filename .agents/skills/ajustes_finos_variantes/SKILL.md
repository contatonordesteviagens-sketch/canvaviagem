---
name: ajuste-fino-variantes
description: Skill essencial para ajustes visuais cirúrgicos no Canvas 2D, tradução de espaçamentos em pixels e aplicação isolada nas Variantes da Fábrica.
---

# MANUAL DE AJUSTES FINOS E CIRÚRGICOS NO MOTOR CANVAS
Este arquivo treina agentes de IA sobre como manipular, espaçar e alterar coordenadas no `src/lib/fabrica-compose-art.ts` em cenários pontuais, operando com isolamento e segurança máxima (Arquitetura Lovable/Antigravity).

## 1. TABELA DE CONVERSÃO (Linguagem Humana → Pixels)
Quando o usuário pedir ajustes visuais baseados no mundo real, aplique estas regras matemáticas para o Canvas (Baseado no Canvas 1080x1080 ou 1080x1920):
- **1 cm** = `~40 px`
- **0,5 cm** = `~20 px`
- **1 mm** = `~4 px`
- **"sobe" / "subir"** = Subtrai do Y (ex: `- 10`)
- **"desce" / "descer"** = Soma no Y (ex: `+ 10`)
- **"esquerda"** = Subtrai do X (`- X`)
- **"direita"** = Soma no X (`+ X`)
- **Medida exata ("2px", "10px")** = Aplique literalmente, não invente proporções.
- **"aumentar a fonte"** = Adicione de +4 a +8px e **ajuste o que estiver embaixo** (padding/gap inferior).
- **"espaçar os ícones"** = Aumente propriedades locais como `gap`, `slotH` e `step`. Não se esqueça de compensar a `height` (cardH) do bloco que envolve os ícones, caso contrário o texto vaza pela base.

## 2. LEIS DE ISOLAMENTO CIRÚRGICO
1. **O Branch é o Limite:** NENHUMA linha de código pode ser mexida fora do bloco da variante. Se mexer na **V0**, altere apenas dentro de `if (variant === 0) { ... }`.
2. **Contexto de Formato (Story vs Feed):** Se o pedido mencionar Story ou Feed, o ajuste ocorre no sub-bloco `if (format === "story")` local daquele branch. Se for global para a variante, modifique os tokens unificados.
3. **Não polua variáveis base:** Para afastar um ícone de um texto, some diretamente o valor offset no elemento que será alterado (`+ 40`). Nunca altere o `baseY` principal, caso contrário o layout inteiro despenca.
4. **Safe Zones Absolutas:** Margem lateral mínima = `65px`. No Story: Base mínima livre = `250px` e Topo mínimo livre = `250px`. 
5. **Textos:** Textos do usuário (destinos, etc) NUNCA podem ser desenhados cruzeiramente com `ctx.fillText`. Use sempre `safeFillText` (uma linha) ou `wrapTextSafe` (várias linhas).

## 3. O PROTOCOLO DE 6 CAMPOS (OBRIGATÓRIO)
Obrigatório ANTES de você, agente, efetuar o `multi_replace_file_content`. Crie um output contendo exatamente esse planejamento estruturado (no seu response de texto):

```text
**VARIANTE:** [Ex: V0]
**FORMATO:** [Ex: Feed e Story / Somente Story]
**ELEMENTO:** [Ex: Ícones de benefícios e Preço]
**MUDANÇA:** [Ex: Ícones espaçados em 40px (1cm) e Preço aumentado proporcionalmente (2cm / +80px)]
**RESTRIÇÃO:** [Ex: Manter margens anti-colisão e cardH proporcional]
**NÃO ALTERAR:** [Ex: Helpers globais e variantes V1 a V8]
```

## 4. EXEMPLOS PRÁTICOS (RESOLVIDOS)

**Pedido:** *"muda algo na varição v0, dar espaçamento de 1 cm para cada icone e aumenta o preço em 2cm"*
1. **Buscar Branch:** Localizar a V0 (`if (variant === 0)`).
2. **Tradução:** 1 cm = +40px. Aumentar o preço em 2cm (fonte +80px ou offset de 80px). 
3. **Ajuste Cirúrgico (Ícones):** Identificar o loop de benefícios (`highlights`). Adicionar `+ 40` ao gap ou step entre os ícones. Ajustar a altura do retângulo que engloba esses ícones (`cardH += 40 * quantidade`).
4. **Ajuste Cirúrgico (Preço):** Aumentar o token de `priceFontSize += 80`. Alterar também o `Y` inicial dele e realocar as frases abaixo dele (como "por pessoa" ou faixas pix) para não sobrepor o novo tamanho da fonte.
