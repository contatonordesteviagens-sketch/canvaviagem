# Histórico e Backup da Versão V8 (Luxury Deal)

## O que tentamos fazer
- Criamos a variante **V8** baseada em um design de "Luxury Experience Deal" para o Feed e Story.
- Adicionamos um bloco de preço escuro na esquerda (com "a partir", o preço gigante e "por pessoa / Total").
- Adicionamos um bloco amarelo de ícones na direita.
- Tentamos equilibrar o design usando posicionamentos precisos (Math.round e percentuais dinâmicos).

## Problemas e Desafios (Por que pausamos)
- **Altura da Caixa Amarela vs Preta**: Ao ajustar para Story e Feed, as proporções ficavam muito distantes. Se aumentávamos a amarela, sobrava muito espaço em branco. Se ancorávamos ao topo, ela sobrepunha o CTA.
- **Grids de Ícones**: O V8 pedia ícones na caixa amarela. Quando adicionamos 4 a 6 ícones, eles ficavam muito espremidos na largura. Dividimos em 2 colunas, mas a altura dinâmica quebrou e o último item ("wfsdfdf") ficou cortado.
- **Ancoragem (Bottom vs Top)**: O maior vilão. Tentar ancorar a caixa preta embaixo e a caixa amarela alinhada pelo centro sem saber a quantidade exata de ícones gerou conflitos matemáticos de sobreposição no CTA (o botão `GARANTIR VAGA`).

## Como retomar no futuro
1. Os arquivos modificados e estabilizados até o nosso último deploy do V8 estão salvos na pasta local `src/backup_v8/`. 
2. Você tem os arquivos `fabrica-compose-art.ts` e `Fabrica.tsx` com a lógica da V8 preservada dentro dessa pasta.
3. Para voltar a mexer no V8, basta copiar os arquivos da pasta `backup_v8` para os seus lugares originais, ou consultar a lógica construída lá.
4. **Dica para a V8**: Da próxima vez, desvincule a caixa amarela da caixa preta. Calcule a altura da caixa amarela primeiro (baseada na quantidade de itens e colunas) e DEPOIS posicione a caixa preta acompanhando.

## Status Atual
Restauramos o código para o último commit estável (o V3/V2 original que já funcionava perfeitamente). 
**Nenhum deploy foi feito após a restauração**, mantendo o ambiente de produção seguro.
