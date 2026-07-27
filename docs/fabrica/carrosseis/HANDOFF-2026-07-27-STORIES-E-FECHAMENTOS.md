# Handoff: Stories, novos designs e fechamentos

Data: 27/07/2026

## Escopo entregue

- formato Feed 4:5 com exportacao em 1080 x 1350;
- formato Stories 9:16 com exportacao em 1080 x 1920;
- formato salvo por projeto e pacote no rascunho local;
- areas de conteudo dos Stories afastadas do topo e do rodape;
- capa herdada do F1 preservada no Feed e enquadrada em 9:16 nos Stories;
- novo objetivo `Destaque`, inspirado em manchetes sobre degradê de marca;
- novo objetivo `Bilhete`, inspirado em cartao de embarque;
- contraste automatico entre texto e as duas pontas do degradê;
- fechamento visual especifico para cada objetivo;
- CTA final usando a paleta da agencia, sem amarelo fixo da interface;
- troca de objetivo atualiza tambem a capa nativa e o fechamento;
- Instagram e site continuam visiveis quando preenchidos no fechamento;
- rascunhos antigos continuam sendo restaurados como Feed 4:5.

## Contrato visual

O amarelo `#F5F906` pertence a interface da Fabrica. Ele continua indicando
selecao e acoes do produto, mas nao e mais usado como cor fixa nas artes.

Os fechamentos usam `primaryColor` e `secondaryColor` da agencia. A cor do texto
e calculada por contraste WCAG relativo contra o fundo escolhido.

## Familias de fechamento

- Inspirar: foto imersiva e chamada central;
- Roteiro: faixa inferior escura com acento da marca;
- Guia: composicao editorial clara;
- Oferta: painel comercial com degradê da marca;
- Confianca: painel claro e CTA contornado;
- FAQ: bloco de marca assimetrico;
- Curvo: painel organico;
- Transparente: painel translúcido;
- Destaque: manchete sobre degradê;
- Bilhete: cartao de embarque com separador perfurado.

## Persistencia

O rascunho permanece na chave:

```text
fabrica-carousel-v2:<locale>:<projectId>:<packageId>
```

O novo campo e:

```text
carouselFormat: "feed" | "story"
```

## Arquivo alterado

- `src/components/fabrica/F1CarouselBuilder.tsx`

Nenhum arquivo do motor de anuncios F1, banco, CRM ou Supabase foi alterado.

## Validacao

- `npm run build`: aprovado;
- `npx eslint src/components/fabrica/F1CarouselBuilder.tsx`: aprovado;
- trava de seguranca do Supabase: aprovada;
- rota local `/fabrica/carrossel`: carregada sem erro de runtime;
- estado sem pacote: preservado.

## Proximos investimentos de produto

1. gerar tres ganchos A/B por objetivo e registrar qual foi usado;
2. adicionar carrosseis de prova social, comparativo e antes/depois;
3. oferecer Stories interativos com sugestoes de enquete, pergunta e link;
4. salvar kits de campanha e reaproveitar um pacote em Feed, Stories e Reels;
5. registrar desempenho por criativo: alcance, salvamentos, compartilhamentos,
   cliques e leads;
6. recomendar a proxima arte com base nos resultados reais da agencia.
