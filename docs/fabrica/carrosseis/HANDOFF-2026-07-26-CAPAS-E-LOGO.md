# Handoff: capas e controle de logo

Data: 26/07/2026

## Escopo entregue

- controle opcional de logo no carrossel;
- logo ativada por padrao;
- preferencia de logo salva no rascunho do projeto e pacote;
- exportacao respeita a logo ativada ou desativada;
- capa nativa editavel quando o usuario entra diretamente no Carrossel F2;
- capa nativa segue o objetivo visual selecionado;
- capa do Anuncio F1 preservada quando o carrossel nasce de uma arte gerada;
- caminho de volta ao Anuncio F1 para gerar outra capa;
- acao para substituir a arte do anuncio por uma capa nativa editavel;
- acao no Anuncio F1 para continuar o fluxo usando a arte atual como capa;
- alinhamento consistente de selo, titulo e conteudo nos objetivos Curvo e
  Transparente;
- objetivo Oferta centralizado em todos os slides;
- seletores circulares de cor reduzidos.

## Regras de capa

### Entrada direta no Carrossel F2

O primeiro slide e criado como `coverSource: "native"`. Ele usa uma foto limpa
do pacote ou do banco de imagens e passa pelo mesmo motor visual dos demais
slides. Textos, foto, cores e objetivo continuam editaveis.

### Entrada a partir do Anuncio F1

O Anuncio registra um marcador temporario por projeto em `sessionStorage`:

```text
fabrica-carousel-ad-cover:<projectId>
```

O Carrossel consome esse marcador uma unica vez e cria a capa como
`coverSource: "ad"`. Nesse caso, a composicao original e preservada. O usuario
pode:

1. voltar ao Anuncio F1 e gerar outra arte;
2. trocar para uma capa nativa editavel.

O marcador nao e usado como persistencia de projeto. Ele existe apenas para
identificar a origem da navegacao atual.

## Controle de logo

`showLogo` inicia como `true` e e salvo no rascunho local:

```text
fabrica-carousel-v2:<locale>:<projectId>:<packageId>
```

Quando desativado, a logo deixa de aparecer na previa, nos slides e nos arquivos
exportados. A verificacao de qualidade nao exige uma logo quando essa opcao esta
desativada.

## Arquivos alterados

- `src/components/fabrica/F1CarouselBuilder.tsx`
- `src/pages/fabrica/Phase3ArtFactory.tsx`
- `src/pages/fabrica/Phase3ArtFactoryES.tsx`

As alteracoes em `Phase3ArtFactory*` se limitam ao handoff de navegacao entre
Anuncio F1 e Carrossel F2. O motor Canvas e suas variantes nao foram alterados.

## Validacao

- `npm run build`: aprovado;
- trava de seguranca do Supabase: aprovada;
- `git diff --check`: aprovado;
- rota local carregada sem erros de runtime;
- estado sem pacote mostra corretamente o bloqueio "Primeiro adicione um pacote".

Para QA visual completo com dados reais, selecionar um projeto com pacote e
validar:

- logo ligada e desligada na previa e no download;
- capa nativa nos oito objetivos;
- capa herdada do Anuncio F1;
- troca de capa herdada para nativa;
- Curvo nos slides pares e impares;
- Transparente nos slides pares e impares;
- Oferta com selo, titulo, descricao e complementos centralizados.

## Limites preservados

- nenhum dado do banco foi alterado;
- nenhuma tabela ou politica RLS foi alterada;
- nenhum arquivo do motor `src/lib/fabrica-compose-art.ts` foi alterado;
- nenhum codigo de outros agentes deve ser incluido no commit desta entrega.

## Ajustes complementares

Depois da primeira validacao visual:

- o fechamento deixou de renderizar o texto substituto "SUA LOGO" quando a
  exibicao da logo esta desativada;
- a capa nativa passou a oferecer cinco titulos persuasivos selecionaveis,
  gerados a partir do destino do pacote;
- o layout Inspirar recebeu uma linha curta de destaque na capa nativa;
- os complementos do layout Transparente passaram a usar uma unica coluna,
  mantendo selo, titulo, descricao e informacoes no mesmo alinhamento em slides
  pares e impares.
