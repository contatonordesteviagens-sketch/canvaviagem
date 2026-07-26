# Guia de design
## Princípios

1. A fotografia do destino deve continuar reconhecível.
2. Cada slide deve cumprir uma única função narrativa.
3. Título, descrição e informações complementares são campos independentes.
4. Texto nunca pode sair do canvas ou encobrir completamente a paisagem.
5. A capa original do Anúncio F1 não deve ser redesenhada pelo carrossel.
6. A sequência precisa manter destino, pacote e identidade visual consistentes.

## Ritmo recomendado

- Capa: oferta ou promessa principal.
- Slide 2: contexto ou experiência.
- Slide 3: valor, roteiro ou diferencial.
- Slide 4: informação prática.
- Slide 5: objeção, confiança ou prova.
- Fechamento: CTA e WhatsApp.

O número real de slides adapta essa narrativa sem duplicar conteúdo.

## Posicionamento

- Inspirar: conteúdo a 14% da base, deixando respiro inferior.
- Roteiro: painel preso à base, mínimo aproximado de 32%, crescendo para cima.
- Oferta: painéis alternados para criar continuidade entre slides.
- Curvo: curva voltada para o espaço negativo da imagem.
- Transparente: painel menor e deslocado, preservando leitura da fotografia.

## Cores

- Cada campo guarda sua própria cor em `titleStyle.color`,
  `bodyStyle.color` e `bulletStyle.color`.
- Ao trocar entre famílias claras e escuras, cores potencialmente invisíveis
  são descartadas e o novo layout utiliza seu padrão legível.
- FAQ sempre recalcula a cor ao entrar ou sair, pois o fundo usa a cor principal
  da agência e pode ser claro ou escuro.

## Conteúdo denso

Roteiro, Oferta e FAQ usam escala progressiva conforme a soma de caracteres.
Essa proteção existe para evitar cortes, mas o conteúdo ideal continua curto:

- título: uma ideia;
- descrição: até duas frases;
- complementos: até quatro itens objetivos.
