## Objetivo

Melhorar os anúncios da Fábrica adicionando 3 novos comportamentos no Phase 3:

1. Novo campo **"Título do anúncio"** com presets editáveis (substitui o headline aleatório atual).
2. **Lixeira** acima de cada variação gerada para excluir individualmente.
3. **Baixar todas as variações visíveis** em um único clique (1,2 ou 3 png, baixar separadamente). 

---

## 1. Novo seletor de Título (4º campo da grade)

### Layout do bloco "3 · Dados do anúncio"

Hoje a grade tem 2 colunas × 1 linha (Destino + Promoção). Vai virar **2 colunas × 2 linhas**:

```text
┌─────────────────┬─────────────────┐
│ Destino *       │ Nome da promoção│
├─────────────────┼─────────────────┤
│ Modo do preço   │ Título do anúncio (NOVO)
└─────────────────┴─────────────────┘
```

(O bloco "Modo de exibição do preço" hoje fica abaixo solto — vamos encaixá-lo na grade junto com o novo campo Título, como você pediu: "essas quatro opções em uma grade, duas fileiras para cada".)

### Campo "Título do anúncio"

- Dropdown/Select com 16 presets, cada um usando o placeholder `{destino}` substituído dinamicamente pelo valor do campo Destino.
- Abaixo do select, um **input editável** mostrando o título resolvido (ex.: "Pacote Jericoacoara"), que o usuário pode customizar livremente.
- Opção extra "✏️ Personalizado" no topo do dropdown que apenas habilita edição livre.

### Lista de presets (com `{destino}` como variável) Essa parte não deve ocupar muitos espaços e nem mostrar todas as opções, ao clicar essa parte aparece uma lista para escolher uma das opções de titulos

```
1.  Conheça o melhor de {destino}
2.  Descubra {destino}
3.  Pacote {destino}
4.  Explore {destino}
5.  {destino} vai te surpreender
6.  Você precisa conhecer {destino}!
7.  O que fazer em {destino}
8.  O melhor de {destino}
9.  Meu sonho se chama {destino}
10. Partiu {destino}
11. Sua próxima viagem é {destino}
12. Pacote Promocional {destino}
13. Viagem Completa {destino}
14. {destino} te espera
15. Vamos para {destino}?
16. ✏️ Personalizado (texto livre)
```

Padrão inicial: preset 3 ("Pacote {destino}"). Persistido em `state.lastAdTitle` no FabricaContext.

### O frase "Sua próxima viagem começa agora"

Conforme você pediu, será **removida** dos pools automáticos do composer.

---

## 2. Pipeline do título até a arte

- Adicionar 2 campos opcionais na interface `ComposeTravelAdOptions` em `src/lib/fabrica-compose-art.ts`:
  - `titleOverride?: string` — quando preenchido, ignora o pool aleatório e usa esse texto como `titleText` em **todas as variantes** (V0/V1/V2 + experiência).
  - Auto-shrink já existente cobre títulos longos.
- Em `Phase3ArtFactory.tsx`, passar `titleOverride: resolvedTitle` em todas as 3 chamadas a `composeTravelAd` (modo Foto, modo Sua Imagem, modo IA Pura).
- Remover "Sua próxima viagem começa agora" de `ofertaBase` no composer.

---

## 3. Lixeira para excluir variação individual

Em `src/pages/fabrica/Phase3ArtFactory.tsx`, no bloco que renderiza `generatedImages.map(...)`:

- Adicionar wrapper `relative` no card da imagem.
- Botão flutuante no canto superior direito de cada imagem:
  - Ícone `Trash2` (lucide), fundo preto translúcido (`bg-black/60`), borda branca sutil, hover vermelho.
  - `onClick` chama `setGeneratedImages(prev => prev.filter((_, i) => i !== idx))`.
  - Sempre visível (não só no hover) para clareza em mobile.

Nada de tooltip extra; o ícone é autoexplicativo.

---

## 4. Botão "Baixar todas" (substitui "Baixar imagem")

Hoje o botão "Baixar imagem" baixa apenas a última. Vai virar **"Baixar todas"** com este comportamento:

- Se `generatedImages.length === 1` → baixa diretamente o PNG (igual hoje).
- Se `generatedImages.length > 1` → baixa em sequência cada PNG visível, usando o truque de `<a download>` em loop com pequeno `setTimeout` entre cada (≈300 ms) para evitar bloqueio de pop-up. Nomes: `anuncio-{destino}-{format}-1.png`, `-2.png`, `-3.png`.
- Texto auxiliar abaixo do par de botões: *"Ao clicar, todas as variações visíveis acima serão baixadas. Imagens excluídas não entram no download."*
- Se `generatedImages.length === 0` → botão desabilitado.

(Optei por baixar PNGs em sequência em vez de empacotar em ZIP para evitar adicionar a dependência `jszip` — mais simples e sem bibliotecas novas. Se você preferir ZIP único depois, é uma troca pequena.)

---

## Arquivos a alterar

- `src/lib/fabrica-compose-art.ts` — novo campo `titleOverride`; remover frase do pool.
- `src/pages/fabrica/Phase3ArtFactory.tsx` — novo state `adTitlePreset` + `adTitleCustom`; reorganizar grade do bloco "Dados"; passar `titleOverride` nas 3 chamadas; lixeira por imagem; botão "Baixar todas" + aviso.
- `src/hooks/useFabricaContext.tsx` — persistir `lastAdTitle` (1 campo opcional, opcional mas recomendado).

## Memória a atualizar

- Atualizar `mem://features/fabrica-ad-generation-rules` registrando: título passou a ser escolhível por preset com variável `{destino}` e o composer respeita `titleOverride` quando presente.