

# Plano: Ajustar Filtros de Vídeo para Usuários em Espanhol

## Situação Atual

Na página do usuário (Index.tsx), quando o idioma é **espanhol**, os filtros de vídeo são:
- Todos
- **Internacionais** ❌
- Favoritos

## Mudança Solicitada

Para usuários em **espanhol**, os filtros devem ser:
- **Espanhol** ✅ (em vez de "Internacionais")
- Todos
- Favoritos

---

## Solução

### Arquivo: `src/pages/Index.tsx`

**Localizar (linhas 59-71):**
```typescript
const videoFilters = language === 'es'
  ? [
      { id: 'todos' as const, label: t('filter.all') },
      { id: 'internacionais' as const, label: t('filter.international') },
      { id: 'favoritos' as const, label: '⭐ ' + t('category.favorites') },
    ]
  : [...]
```

**Substituir por:**
```typescript
const videoFilters = language === 'es'
  ? [
      { id: 'todos' as const, label: t('filter.all') },
      { id: 'internacionais' as const, label: '🇪🇸 Español' },
      { id: 'favoritos' as const, label: '⭐ ' + t('category.favorites') },
    ]
  : [...]
```

---

## Resultado Final

### Português (PT):
```
[Todos] [Nacionais] [Internacionais] [⭐ Favoritos]
```

### Espanhol (ES):
```
[Todos] [🇪🇸 Español] [⭐ Favoritos]
```

---

## Resumo

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Index.tsx` | Alterar label de "Internacionais" para "🇪🇸 Español" quando idioma = ES |

