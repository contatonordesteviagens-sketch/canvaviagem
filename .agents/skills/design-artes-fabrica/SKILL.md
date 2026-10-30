---
name: design-artes-fabrica
description: Padrão de qualidade de design gráfico para TUDO que a Fábrica desenha (artes V0–V8 em src/lib/fabrica-art-pro.ts e carrosséis em F1CarouselBuilder/CarouselCanvas). Ative sempre que for criar, ajustar, revisar ou aprovar uma arte, variação, slide ou modelo de carrossel; quando o Lucas disser "ficou amador", "texto no vazio", "desalinhado", "bloco vazio", "sobrepondo", "simetria", ou pedir "nova variação" / "novo modelo".
---

# Design gráfico das artes e carrosséis da Fábrica

Referências que definem o padrão: `C:\Users\win 10\Downloads\referencias` (CVC, Decolar, Clube Turismo,
Enseada, Batata Turismo, hotéis de luxo). Contact sheets em `C:/tmp/lab-shots/refs/`. Nota 15 do segundo cérebro.

## 1. As 7 regras (toda arte passa por todas)

1. **Bloco flexível.** Cartão, painel, faixa, botão e bloco de cor têm a altura **e a largura** do conteúdo
   que carregam (um botão com texto curto é curto; uma caixa de preço mede `priceNaturalWidth()`).
   Nunca repita a mesma foto em recortes; uma foto só, bem enquadrada. Meça antes de pintar (passada `dry`), depois desenhe o fundo e por fim o texto.
   Pouco texto = bloco pequeno; muito texto = bloco maior, até um teto; passou do teto, reduza a escala
   (`fitScale`), nunca corte nem vaze.
2. **Um eixo por bloco.** Dentro de um bloco todos os elementos partem da mesma linha à esquerda
   (ou do mesmo centro). Título, lista, preço e pílulas começam no mesmo `x` e respeitam a mesma largura
   máxima. Nada "um pouco mais para a direita". Alinhamento misto (um centrado, outro à esquerda) é erro.
3. **Rodapé reservado.** Logo e contatos (`drawFinalBranding`) ocupam `[footerTop, footerTop + footerH]`
   (quadrado: 940–1040; story: 1570–1690). Conteúdo termina em `F.bottom` (28px acima). Nada sobrepõe.
   Contatos usam a cor de contraste do fundo onde caem (`contrastOn`), nunca branco fixo.
4. **Texto nunca solto sobre foto.** Sempre dentro de cartão, bloco de cor ou véu (`veil`). Fonte branca
   sobre areia/céu é proibida. Nenhum texto branco em caixa branca, nem escuro em caixa escura.
5. **Um ponto focal.** Oferta: o preço é o maior elemento (`priceBlock`, número ≥ 110px no quadrado).
   Experiência: a headline (ou o destino) é o maior; o preço não existe; o lugar dele é
   subtítulo + CTA `RESERVE AGORA` (`experienceBlock`, CTA ≥ 26px).
6. **Escala tipográfica fixa.** Kicker 20–24 · corpo/lista 26–32 · subtítulo 28–40 · título 64–96 ·
   preço 110–170. Nada fora disso. Ícones têm rótulo quando há espaço; só glifos quando não há.
   Letras miúdas (condições) só em `legalLine`, 18px, centralizadas, acima do rodapé.
7. **Safe zones.** Story: 0–250px e os últimos 310px são do Instagram (só foto/fundo ali). Margem lateral
   72px (quadrado) / 80px (story). Bloco de cor chapada ≤ ~55% da arte e sempre denso.

## 2. Famílias de layout (uma referência por variação)

| V | Família | Referência |
|---|---|---|
| V0 | bloco superior denso + foto | Enseada "3 praias em 1 dia" |
| V1 | painel claro lateral, título em faixa que invade a foto | Batata Turismo "Conheça Maragogi!" |
| V2 | foto em cima, bloco claro embaixo, faixa de título na emenda | Batata "Conheça Santa Teresa!" |
| V3 | cartão arredondado na cor da marca, preço gigante, faixa Pix | CVC Portugal / Maceió / Gramado |
| V4 | foto em moldura + bloco da marca com dois cartões | Decolar Cancún |
| V5 | cartão branco centrado, pílula na borda | Cartagena |
| V6 | foto + bloco inferior em duas colunas (destino \| preço) | Tailândia / New York (Gricel) |
| V7 | um cartão no alto (tudo à esquerda) + faixa "o que inclui" | Jalapão / Gricel |
| V8 | destino em serifa gigante sobre véu + pílula + CTA | "NEW YORK" hotel deals |
| V9 | coluna escura (headline, checklist em pílulas, preço) + coluna da marca com tira de 3 fotos | Black Friday "Combo 4 praias" |
| V10 | coluna centralizada sobre a foto: nome em script, destino, pino, data, ícones com rótulo, selo de preço | Saint-Michel "Jalapão e Palmas" |
| V11 | título centrado no alto, caixa de preço + cartão de benefícios lado a lado, CTA de largura cheia | "All-inclusive Hotel Deals" |

Total: `PRO_TOTAL_VARIANTS = 12` (motor, rodízio da UI e botões 1–12 leem daí).

Nova variação = anatomia estrutural nova (posição da foto, divisão de blocos). Mesma anatomia com outro
texto é ajuste, não variação. Antes de codar uma nova, escreva a anatomia em % e mostre ao Lucas.

## 3. Como trabalhar (motor de artes)

- Arquivo: `src/lib/fabrica-art-pro.ts`. Primitivas: `paragraph`, `pill`, `iconList`, `iconStrip`,
  `priceBlock`, `experienceBlock`, `pixStripe`, `veil`, `kickerText`, `legalLine`. Todas aceitam `dry`.
- Cada layout tem `content(k, dry, y0)` que devolve a altura. Fluxo: `fitScale(content, maxH)` →
  geometria do bloco → fundo → `content(k, false, y)` → `branding(m, corDosContatos)`.
- Cores: `brandPair(m)` escolhe cartão claro + destaque; `isLight`/`contrastOn` decidem a cor do texto.
  Paleta vinho/creme e turquesa/branco são os casos difíceis: teste as duas.
- Fontes: `fontsOf(m)` — o usuário pode trocar a família; serifa do usuário vira também a `serif`.
- Motor antigo continua em `fabrica-compose-art.ts`; `legacyLayouts: true` força o antigo.

## 4. Matriz de teste obrigatória antes de commit

Laboratório (só dev): `http://localhost:8080/dev/artes-lab`. Script: `bash /c/tmp/lab-shots/shoot.sh <prefixo> "<query>"`
gera as 4 grades (feed/story × oferta/experiência). Rode no mínimo:

```
palette=cv
palette=cvc&city=Maceió&dest=Porto de Galinhas&price=1.299,00&inst=12x&long=1
palette=wine&font=Playfair Display&pay=cash&price=2.490&cents=0&dest=Gramado
palette=teal&pay=down_plus&price=500,00&city=Recife&dest=Fernando de Noronha
```

Checklist por arte (olhe a grade, uma por uma):
- [ ] nenhum bloco com mais de ~15% de área vazia; nenhum texto vazando do bloco
- [ ] nada entre o conteúdo e o rodapé além de respiro; logo e contatos sem nada por baixo
- [ ] todos os textos do bloco na mesma linha esquerda (ou centro); larguras coerentes
- [ ] preço/headline é o maior elemento; CTA legível; ícones com rótulo
- [ ] contraste ok em texto, pílulas, contatos e logo (claro sobre escuro, escuro sobre claro)
- [ ] story: nada útil nos 250px do topo nem nos 310px da base
- [ ] `npx tsc --noEmit` = 0 e `npx vite build` ok

## 5. Carrosséis (próxima fase) — as mesmas regras

`F1CarouselBuilder.tsx` / `CarouselCanvas` (DOM, não canvas): aplicar 1–7 a cada slide. Em especial:
capa com um ponto focal; slides internos com a mesma margem e o mesmo eixo; título e corpo na mesma
coluna; selo e numeração sempre no mesmo canto em todos os slides; último slide com CTA e contatos
alinhados. Modelos novos propostos na nota 14 (Polaroid, Revista, Mapa/Rota, Preço em destaque, Conversa).
