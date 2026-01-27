
# Plano: Remover Cronômetro e Limpar Links do Rodapé

## Resumo

Duas alterações simples:
1. Remover o componente `CountdownTimer` da seção de preços da página Próximo Nível
2. Remover os links "Planos", "Modelos" e "Contato" do rodapé

---

## Alteração 1: Remover Cronômetro (ProximoNivel.tsx)

**Arquivo:** `src/pages/ProximoNivel.tsx`

**O que será removido:**
- O componente `CountdownTimer` (linhas 32-72) - código morto após remoção do uso
- A chamada `<CountdownTimer />` na seção de preços (linha 525)
- O import `useState` e `useEffect` se não forem mais usados

**Seção de preços ANTES:**
```tsx
<CardContent className="p-5 md:p-8 text-center space-y-4 md:space-y-6">
  {/* Countdown Timer */}
  <CountdownTimer />
  
  <h3 className="text-xl md:text-2xl font-bold text-white">
```

**Seção de preços DEPOIS:**
```tsx
<CardContent className="p-5 md:p-8 text-center space-y-4 md:space-y-6">
  <h3 className="text-xl md:text-2xl font-bold text-white">
```

---

## Alteração 2: Limpar Links do Rodapé (Footer.tsx)

**Arquivo:** `src/components/Footer.tsx`

**Links ANTES (linha 40-46):**
```typescript
const quickLinks = [
  { name: "Início", to: "/" },
  { name: "Calendário", to: "/calendar" },
  { name: "Planos", to: "/planos" },           // REMOVER
  { name: "Modelos", to: "/#artes" },          // REMOVER
  { name: "Contato", to: "mailto:...", external: true },  // REMOVER
];
```

**Links DEPOIS:**
```typescript
const quickLinks = [
  { name: "Início", to: "/" },
  { name: "Calendário", to: "/calendar" },
];
```

---

## Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/ProximoNivel.tsx` | Remover componente CountdownTimer e sua chamada |
| `src/components/Footer.tsx` | Remover 3 links do array quickLinks |
