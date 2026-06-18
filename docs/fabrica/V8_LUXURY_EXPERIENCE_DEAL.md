# V8 - Luxury Experience Deal

Data: 2026-06-18

## Motivo do indice V8

O usuario confirmou que a V7 ja esta pronta e nao deve ser alterada.
Por isso, esta nova versao foi implementada como **V8**, adicionada por cima da main atual sem sobrescrever a V7.

No codigo atual:

- `variant === 7` permanece intacta;
- `variant === 8` contem a variante Luxury Experience Deal;
- as telas PT/ES sorteiam e permitem selecionar V0..V8.

## Referencia

Arquivo enviado pelo usuario:

```text
C:\Users\win 10\Downloads\referencias\ads referencias\categoria experiencias de luxo\683319372_2015587199071863_4802020463314756055_n.jpg
```

Caracteristicas visuais:

- foto full-bleed no fundo;
- texto principal solto no topo, com sombra forte;
- badge superior com nome da promocao;
- pill de informacao com periodo/dias;
- bloco de preco grande no lado esquerdo;
- card claro de beneficios no lado direito, com icone e texto;
- CTA horizontal na base;
- cores respeitam `primaryColor` e `secondaryColor` escolhidas pelo usuario.

## Arquivos alterados

```text
src/lib/fabrica-compose-art.ts
src/pages/fabrica/Phase3ArtFactory.tsx
src/pages/fabrica/Phase3ArtFactoryES.tsx
docs/fabrica/V8_LUXURY_EXPERIENCE_DEAL.md
docs/fabrica/AGENTE_VARIANTES_IMAGENS.md
```

## Anatomia

### Feed 1080x1080

```text
Fundo:       foto 100% full-bleed
Topo:        badge central da promocao + titulo solto
Info:        pill central com dias/data
Esquerda:    bloco de preco
Direita:     card com 3 beneficios
Base:        CTA horizontal acima do branding
Branding:    logo/contatos via drawFinalBranding
```

### Story 1080x1920

```text
Fundo:       foto 100% full-bleed
Topo:        badge + titulo em ate 3 linhas
Meio:        pill de periodo
Centro:      preco esquerdo e beneficios direitos
Base:        CTA acima da area de contato
Branding:    logo/contatos via drawFinalBranding
```

## Mapeamento de campos

| Campo do formulario | Uso na V8 |
|---|---|
| `promoName` | badge superior, ex.: `SUPER OFERTA` |
| `titleOverride/titleText` | titulo principal solto; `{destino}` vira o destino real |
| `destination` | fallback do titulo e substituicao de `{destino}` |
| `travelPeriod` | pill de informacao, ex.: `DEZEMBRO` |
| `pricePrefix/paymentLabel/topLabel` | label acima do preco, ex.: `PRECO` |
| `currencySymbol + price` | preco grande no bloco esquerdo |
| `paymentSuffix` | complemento do preco, ex.: `POR PESSOA` |
| `pixBannerText` | texto do CTA inferior; se vazio, usa `RESERVAR AGORA` |
| `highlights` | 3 beneficios no card direito |
| `primaryColor` | fundo do badge, bloco de preco e CTA |
| `secondaryColor` | pill de informacao, icones, borda do CTA |

## Regras de seguranca

- Nao altera V0-V6.
- Nao altera V7.
- V7 continua disponivel na rotacao e no seletor.
- V8 usa branch isolado dentro de `renderSafeSquareOffer`.
- A interface da Fabrica continua usando amarelo fixo; as cores do usuario so entram na arte gerada.

## Checklist de QA

1. Selecionar `Versao do Design -> V8`.
2. Testar em Feed e Story.
3. Preencher:
   - destino: `Fernando de Noronha`;
   - promocao: `SUPER OFERTA`;
   - titulo: `Voce precisa conhecer {destino}!`;
   - periodo: `Dezembro`;
   - preco: `149,90`;
   - prefixo: `PRECO`;
   - complemento: `por pessoa`;
   - CTA/desconto: `10% OFF NO PIX`.
4. Confirmar:
   - titulo nao corta;
   - preco fica no bloco esquerdo;
   - card direito mostra beneficios;
   - CTA fica legivel;
   - logo/contatos nao sobrepoem o CTA;
   - V7 nao foi sobrescrita.

