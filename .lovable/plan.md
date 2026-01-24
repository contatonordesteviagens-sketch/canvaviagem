

# Plano: Melhorias na Navegação Mobile

## Visão Geral
Este plano aborda duas melhorias na interface mobile:
1. **Navegação inferior (BottomNav)**: Substituir os links atuais por abas funcionais que navegam entre categorias de conteúdo
2. **Navegação de categorias (CategoryNav)**: Adicionar setas de navegação e uma animação sutil de "dica" para indicar scroll horizontal

---

## Mudança 1: Nova Navegação Inferior Mobile

### Problema Atual
A barra inferior mostra links quebrados ("Projetos", "Modelos", "Criar") que não existem no app.

### Solução
Substituir por 4 abas que funcionam como atalhos para categorias do conteúdo:

| Aba | Ícone | Categoria que Ativa |
|-----|-------|-------------------|
| IA | Bot | `tools` |
| Artes | Image | `feed` |
| Aula | GraduationCap | `videoaula` |
| Favoritos | Heart | `favorites` |

### Como Funciona
- Em vez de navegação por rotas, as abas vão **comunicar com a página Index** para mudar a categoria ativa
- Usaremos um callback `onCategoryChange` passado via props ou contexto

---

## Mudança 2: Indicadores de Scroll + Animação no CategoryNav

### Problema Atual
Usuários não percebem que podem arrastar para ver mais categorias.

### Solução

**Setas de navegação:**
- Adicionar setas `ChevronLeft` e `ChevronRight` nas extremidades
- As setas ficam visíveis apenas quando há mais conteúdo para rolar naquela direção
- Ao clicar, faz scroll suave para a próxima/anterior categoria

**Animação de "dica":**
- Ao carregar a página, uma animação sutil desloca o carrossel 20px para a esquerda e retorna
- Acontece apenas uma vez (primeira visita)
- Dá a pista visual de que há mais conteúdo

---

## Detalhes Técnicos

### Arquivos a Modificar

**1. `src/components/canva/BottomNav.tsx`**
```text
Mudanças:
- Importar novos ícones (Bot, Image, GraduationCap, Heart)
- Aceitar props: activeCategory e onCategoryChange
- Converter de Links para buttons que chamam onCategoryChange
- Manter visual atual com ícones + labels
```

**2. `src/components/canva/CategoryNav.tsx`**
```text
Mudanças:
- Adicionar ref para o container de scroll
- Implementar detecção de scroll position (canScrollLeft/Right)
- Adicionar botões de seta nas extremidades
- Criar animação keyframe "hint-scroll"
- Adicionar useEffect que roda animação uma vez ao montar
```

**3. `src/index.css`**
```text
Adicionar keyframe de animação:
@keyframes hint-scroll {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-20px); }
}
```

**4. `src/pages/Index.tsx`**
```text
Mudanças:
- Passar activeCategory e onCategoryChange para BottomNav
```

---

## Fluxo Visual

```text
┌─────────────────────────────────────┐
│           CATEGORIA NAV             │
│  ◄  [🎬] [🖼️] [📱] [📝] [⬇️] [🤖]...  ►  │
│      ↑                           ↑  │
│   Seta                       Seta   │
│  (aparece se há mais)              │
│                                     │
│   * Animação sutil ao carregar *   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          CONTEÚDO PRINCIPAL         │
│                                     │
│        (muda com categoria)         │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│           BOTTOM NAV (mobile)       │
│   🤖      🖼️       🎓       ❤️      │
│   IA    Artes    Aula   Favoritos  │
└─────────────────────────────────────┘
```

---

## Resultado Esperado

1. **Bottom Nav funcional** com 4 abas que trocam o conteúdo da página
2. **Setas visuais** indicando que há mais categorias para rolar
3. **Animação sutil** de boas-vindas que "mostra" o scroll horizontal
4. **Experiência mobile** mais intuitiva e profissional

