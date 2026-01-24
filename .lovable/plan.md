
# Plano: Otimização de Abas Externas no Mobile

## Problema Atual
Quando o usuário clica em qualquer link externo (Canva, ferramentas de IA, downloads), o site abre uma nova aba no navegador usando `target="_blank"`. No mobile, isso resulta em **dezenas de abas acumuladas**, prejudicando a experiência do usuário.

## Solução Proposta
Implementar uma estratégia inteligente de gerenciamento de abas:

1. **Links do Canva (vídeos/artes)**: Sempre reutilizar a **mesma aba externa** ao invés de abrir novas
2. **Outras ferramentas**: Também reutilizar uma única aba externa
3. **Navegação interna**: Continuar na mesma aba (já funciona assim)

### Como Funciona Tecnicamente

Usaremos o parâmetro `name` do `window.open()` para especificar o nome da aba:
- `window.open(url, 'canva-editor')` → Sempre abre na mesma aba chamada "canva-editor"
- Se a aba já existir, ela é reutilizada; se não, é criada

---

## Componentes a Modificar

### 1. `src/components/canva/PremiumCard.tsx`
**Usado para**: Vídeos e Artes (templates do Canva)

```text
Mudanças:
- Remover target="_blank" do link <a>
- Alterar handleClick para usar window.open(url, 'canva-editor')
- Impedir o comportamento padrão do link com e.preventDefault()
```

### 2. `src/components/canva/ToolCard.tsx`
**Usado para**: Ferramentas de IA

```text
Mudanças:
- Remover target="_blank" do link <a>
- Alterar handleClick para usar window.open(url, 'canva-tools')
- Impedir o comportamento padrão do link
```

### 3. `src/components/TemplateCard.tsx`
**Usado para**: Cards de template (se ainda em uso)

```text
Mudanças:
- Remover target="_blank" do link <a>
- Adicionar onClick para usar window.open(url, 'canva-editor')
```

### 4. `src/components/ResourceSection.tsx`
**Usado para**: Materiais e Downloads

```text
Mudanças:
- Remover target="_blank" do link <a>
- Adicionar onClick para usar window.open(url, 'canva-resources')
```

### 5. `src/pages/Index.tsx`
**Usado para**: Handler de clique nos cards

```text
Mudanças:
- Atualizar handleCardClick para usar window.open com nome específico
- window.open(item.url, 'canva-editor') em vez de window.open(item.url, '_blank')
```

---

## Estratégia de Nomes de Abas

| Tipo de Conteúdo | Nome da Aba | Resultado |
|------------------|-------------|-----------|
| Vídeos/Artes (Canva) | `canva-editor` | Mesma aba para todos os templates |
| Ferramentas de IA | `canva-tools` | Mesma aba para todas as ferramentas |
| Downloads/Recursos | `canva-resources` | Mesma aba para downloads |

---

## Resultado Final

**Antes**: Cada clique = Nova aba (10 cliques = 10 abas)

**Depois**: Todas as abas do mesmo tipo reutilizam uma única aba externa

```text
Usuário clica em "Vídeo Cancún" → Abre aba 'canva-editor'
Usuário clica em "Vídeo Maldivas" → REUTILIZA aba 'canva-editor' (atualiza URL)
Usuário clica em "Robô IA Vendas" → Abre aba 'canva-tools'
Usuário clica em "Robô IA Copy" → REUTILIZA aba 'canva-tools'

Total de abas externas: MÁXIMO 3 (editor, tools, resources)
```

---

## Benefícios

1. **Mobile amigável**: Usuário não precisa fechar dezenas de abas
2. **Navegação fluida**: Menos confusão entre abas
3. **Performance**: Menos abas = menos memória do navegador
4. **UX melhorada**: Usuário sempre sabe onde está o conteúdo do Canva
