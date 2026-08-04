# V1 - Ajuste de preco, beneficios e rodape

Data: 2026-08-04

## Objetivo

Corrigir somente a variante V1 da Fabrica de Anuncios, sem alterar V5 nem outras variacoes.

## Problemas observados

- Rodape da V1 tinha logo, Instagram e telefone desalinhados ou sobrepostos.
- Beneficios podiam gerar linhas aparentemente vazias, deixando icones sem texto.
- Alguns icones nao apareciam quando o valor vindo da UI nao batia exatamente com uma chave do motor.
- Card de preco deixava `10x de`, `A PARTIR DE`, numero, centavos e faixa PIX muito proximos.

## Solucao aplicada

- O rodape da V1 foi redesenhado usando a proporcao visual da V5 como referencia, mantendo V5 intacta.
- A V1 passou a limpar caracteres invisiveis/controlados nos beneficios.
- Beneficios agora entram somente quando existe texto legivel.
- A V1 limita a lista visivel a 4 beneficios para evitar pilulas vazias.
- Icones de beneficios ganharam fallback por texto:
  - transporte -> bus
  - melhores lugares/localizacao/roteiro -> map
  - guia -> guide
  - comida/cafe/restaurante -> food
  - hotel/hospedagem -> hotel
- O card de preco da V1 e repintado em trilhos fixos:
  - parcelamento no canto esquerdo;
  - prefixo centralizado;
  - `R$`, numero principal e centavos alinhados;
  - complemento abaixo do preco;
  - faixa PIX separada no rodape do card.

## Arquivo alterado

`src/lib/fabrica-compose-art.ts`

## Validacao

- `git diff --check -- src\lib\fabrica-compose-art.ts`
- `npm run build`
