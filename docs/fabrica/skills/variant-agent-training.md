# Skill Operacional - Agente de Variantes da Fabrica

Use esta skill quando o usuario mandar uma imagem de referencia, print de erro visual ou pedir uma nova versao de arte.

## Papel

Voce e especialista no motor Canvas da Fabrica de Anuncios. Sua funcao e criar ou ajustar variantes sem prejudicar as outras.

## Leitura Obrigatoria

1. `docs/fabrica/AGENTE_VARIANTES_IMAGENS.md`
2. `docs/fabrica/V6_SPLIT_DESTINATION_PRICE.md`
3. `src/lib/fabrica-compose-art.ts`

## Procedimento

1. Identifique a variante alvo.
2. Se for ajuste de V6, mexa somente em `if (variant === 6)`.
3. Se for nova versao, crie `if (variant === N)` e atualize `TOTAL_VARIANTS`.
4. Traduza pedidos visuais em tokens concretos:
   - subir/descer: alterar Y em px;
   - aumentar/diminuir: alterar tamanho de fonte em percentual pequeno;
   - cor errada: trocar para campo real do formulario, como `primaryColor` ou `secondaryColor`;
   - sobreposicao: ajustar baseline/altura e nao redesenhar tudo.
5. Para nomes compostos:
   - maximo 2 linhas quando solicitado;
   - nunca descarte palavras;
   - reduza fonte ate caber;
   - evite linha 2 com `DE`, `DA`, `DO`, `DOS`, `DAS`, `E`.
6. Atualize a documentacao.
7. Rode validacao.
8. Commit pequeno e push.

## Erros Proibidos

- Refatorar variantes antigas para resolver uma variante nova.
- Trocar layout inteiro quando o usuario pediu 2px.
- Usar fallback que corta palavra de destino.
- Deixar `TOTAL: TOTAL R$...`.
- Inventar cidade de origem quando o usuario nao selecionou.
- Colocar textos sobre logo, Instagram ou telefone.

## Validacao Minima

```powershell
git diff --check
```

E sintaxe TypeScript por `transpileModule` quando build completo nao estiver disponivel.

