
# Plano: Garantir Funcionamento do Drag-and-Drop na Gestão

## Situação Atual

O sistema de drag-and-drop **já está implementado** no painel de gestão! Quando você seleciona **"Ordem manual (drag)"** no dropdown de ordenação, o ícone de arrastar (⋮⋮) aparece nos cards e você pode reorganizá-los.

### O que já funciona:
- Vídeos, Artes, Stories, Legendas (Nac e Int), Ferramentas e Recursos têm drag-and-drop
- A ordem é salva no banco via `display_order`
- O ícone de arrastar aparece quando `sortOrder === "custom"`

### O problema identificado:
A ordem salva pelo admin **não é aplicada corretamente** na página do usuário porque a função `sortByLanguagePriority` ignora o `display_order`.

---

## Solução

Modificar a função `sortByLanguagePriority` para considerar `display_order` como critério de ordenação **dentro** de cada grupo de idioma.

### Arquivo: `src/lib/language-utils.ts`

```typescript
export function sortByLanguagePriority<T extends { 
  language?: string | null; 
  created_at?: string;
  display_order?: number;  // Adicionar
}>(
  items: T[],
  language: Language
): T[] {
  return [...items].sort((a, b) => {
    const aLang = a.language || 'pt';
    const bLang = b.language || 'pt';
    
    // Prioridade 1: Idioma selecionado primeiro
    const aMatch = aLang === language;
    const bMatch = bLang === language;
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    
    // Prioridade 2: Português como secundário (se não for o selecionado)
    if (language !== 'pt') {
      const aPt = aLang === 'pt';
      const bPt = bLang === 'pt';
      if (aPt && !bPt) return -1;
      if (!aPt && bPt) return 1;
    }
    
    // Prioridade 3: display_order (ordem definida pelo admin)
    const aOrder = a.display_order ?? 9999;
    const bOrder = b.display_order ?? 9999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    
    // Prioridade 4: created_at como fallback
    if (a.created_at && b.created_at) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    
    return 0;
  });
}
```

---

## Como Usar o Drag-and-Drop (Instrução para o Admin)

### Passo a passo:
1. Acesse `/gestao` → Aba "Conteúdo"
2. Escolha a aba do conteúdo que deseja reordenar (Vídeos, Artes, Stories, etc.)
3. No dropdown de ordenação, selecione **"Ordem manual (drag)"**
4. O ícone ⋮⋮ aparecerá no canto superior esquerdo de cada card
5. Clique e arraste o ícone para reposicionar os itens
6. A ordem é salva automaticamente

### Comportamento esperado:
- Ao arrastar e soltar, a nova ordem é salva no banco (`display_order`)
- Na página do usuário, os itens aparecem na ordem definida pelo admin
- A ordenação respeita o idioma: itens do idioma selecionado aparecem primeiro, mantendo a ordem do admin dentro de cada grupo

---

## Resumo das Mudanças

| Arquivo | Mudança |
|---------|---------|
| `src/lib/language-utils.ts` | Adicionar `display_order` como critério de ordenação |

---

## Verificação Final

### No Painel de Gestão:
- [ ] Selecionar "Ordem manual (drag)" mostra ícone ⋮⋮ nos cards
- [ ] Arrastar card funciona em todas as abas (Vídeos, Artes, Stories, Legendas, Ferramentas, Recursos)
- [ ] Toast "Ordem atualizada" aparece após arrastar
- [ ] Filtro de idioma funciona (PT/ES) na aba de Vídeos

### Na Página do Usuário:
- [ ] Itens aparecem na ordem definida pelo admin
- [ ] Idioma selecionado tem prioridade (PT primeiro se usuário está em PT)
- [ ] Dentro de cada idioma, respeita `display_order`
