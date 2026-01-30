
# Plano: Corrigir Sistema de Idiomas (PT como Padrão)

## Problemas Identificados

| Problema | Causa | Impacto |
|----------|-------|---------|
| PT não é mais o padrão | `IndexES.tsx` salva 'es' no localStorage, que persiste quando volta para `/` | Usuário vê ES mesmo em `/` |
| Botão PT não funciona | `/` não força idioma PT - depende do localStorage | Fica preso em ES |
| `/pt` não existe | Rota não definida no App.tsx | Erro 404 |

---

## Solução

### Lógica Correta
- Cada página deve **forçar seu próprio idioma** sem depender do localStorage
- A página PT (`Index.tsx`) deve definir `setLanguage('pt')` igual como `IndexES.tsx` faz com 'es'
- Adicionar rota `/pt` apontando para `Index.tsx`

---

## Mudanças Necessárias

### 1. Modificar `src/pages/Index.tsx` - Forçar PT

Adicionar `useEffect` que força o idioma PT ao montar a página (igual ao que `IndexES.tsx` faz):

```typescript
// Linha ~51, depois de const { language, t } = useLanguage();
// Trocar para:
const { setLanguage, t } = useLanguage();

// Adicionar useEffect após as declarações de estado (após linha ~60):
useEffect(() => {
  document.documentElement.lang = 'pt';
  setLanguage('pt');
}, [setLanguage]);
```

### 2. Adicionar Rota `/pt` no `src/App.tsx`

Adicionar rota que aponta para a mesma página `Index.tsx`:

```typescript
{/* ROTAS PORTUGUÊS */}
<Route path="/" element={<Index />} />
<Route path="/pt" element={<Index />} />  {/* ⭐ ADICIONAR */}
<Route path="/calendar" element={<Calendar />} />
<Route path="/pt/calendar" element={<Calendar />} />  {/* ⭐ ADICIONAR */}
<Route path="/planos" element={<Planos />} />
<Route path="/pt/planos" element={<Planos />} />  {/* ⭐ ADICIONAR */}
```

### 3. Atualizar `src/pages/Calendar.tsx` - Forçar PT

Adicionar a mesma lógica para forçar PT:

```typescript
useEffect(() => {
  document.documentElement.lang = 'pt';
  setLanguage('pt');
}, [setLanguage]);
```

### 4. Atualizar `src/pages/Planos.tsx` - Forçar PT

Adicionar a mesma lógica para forçar PT:

```typescript
useEffect(() => {
  document.documentElement.lang = 'pt';
  setLanguage('pt');
}, [setLanguage]);
```

### 5. Atualizar `src/components/LanguageSwitcher.tsx` - Melhorar Navegação

Atualizar para incluir suporte às novas rotas `/pt`:

```typescript
const switchToLanguage = (targetLang: 'pt' | 'es') => {
  const currentPath = window.location.pathname;
  const searchParams = window.location.search;
  
  if (targetLang === 'es') {
    // Navigate to ES version
    if (currentPath.includes('/planos')) {
      window.location.href = '/es/planos' + searchParams;
    } else if (currentPath.includes('/calendar')) {
      window.location.href = '/es/calendar' + searchParams;
    } else {
      window.location.href = '/es' + searchParams;
    }
  } else {
    // Navigate to PT version - usar /pt para garantir que força o idioma
    if (currentPath.includes('/planos')) {
      window.location.href = '/pt/planos' + searchParams;
    } else if (currentPath.includes('/calendar')) {
      window.location.href = '/pt/calendar' + searchParams;
    } else {
      window.location.href = '/pt' + searchParams;
    }
  }
};
```

---

## Resumo das Mudanças

| Arquivo | Ação | Mudança |
|---------|------|---------|
| `src/pages/Index.tsx` | **MODIFICAR** | Adicionar `useEffect` que força `setLanguage('pt')` |
| `src/pages/Calendar.tsx` | **MODIFICAR** | Adicionar `useEffect` que força `setLanguage('pt')` |
| `src/pages/Planos.tsx` | **MODIFICAR** | Adicionar `useEffect` que força `setLanguage('pt')` |
| `src/App.tsx` | **MODIFICAR** | Adicionar rotas `/pt`, `/pt/calendar`, `/pt/planos` |
| `src/components/LanguageSwitcher.tsx` | **MODIFICAR** | Navegar para `/pt` em vez de `/` |

---

## Fluxo Corrigido

```text
1. Usuário acessa canvaviagem.com/
   ↓
   Index.tsx monta
   ↓
   useEffect: setLanguage('pt') + document.lang = 'pt'
   ↓
   Página em Português ✅

2. Usuário clica em "🇪🇸 ES"
   ↓
   LanguageSwitcher: window.location.href = '/es'
   ↓
   IndexES.tsx monta
   ↓
   useEffect: setLanguage('es') + document.lang = 'es'
   ↓
   Página em Espanhol ✅

3. Usuário clica em "🇧🇷 PT"
   ↓
   LanguageSwitcher: window.location.href = '/pt'
   ↓
   Index.tsx monta
   ↓
   useEffect: setLanguage('pt') + document.lang = 'pt'
   ↓
   Página em Português ✅ (volta funciona!)
```

---

## URLs Finais Disponíveis

| URL | Página | Idioma |
|-----|--------|--------|
| `/` | Index.tsx | PT |
| `/pt` | Index.tsx | PT |
| `/pt/planos` | Planos.tsx | PT |
| `/pt/calendar` | Calendar.tsx | PT |
| `/es` | IndexES.tsx | ES |
| `/es/planos` | PlanosES.tsx | ES |
| `/es/calendar` | CalendarES.tsx | ES |

---

## Testes Esperados

| Teste | Esperado |
|-------|----------|
| Acessar `/` | Página em PT |
| Acessar `/pt` | Página em PT |
| Acessar `/es` | Página em ES |
| Clicar ES em `/` | Navega para `/es`, mostra ES |
| Clicar PT em `/es` | Navega para `/pt`, mostra PT |
| Alternar PT/ES várias vezes | Funciona corretamente |
