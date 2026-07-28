# 🚨 BUGS EM STANDBY — Versão Espanhol (FabricaES)
*Salvo em: 28/07/2026 — Para resolver quando o usuário pedir investigação ES*

> **Para qualquer agente de IA:** Leia este arquivo antes de trabalhar na versão `/es/fabrica`.
> Estes bugs foram identificados em auditoria mas NÃO corrigidos a pedido do usuário (priorizou PT + mobile).

---

## 🔴 BUG CRÍTICO 1 — FabricaES render usa `state.currentPhase` (race condition de hidratação)

**Arquivo:** `src/pages/FabricaES.tsx` — Linhas 38–61 e 398–411

**Problema:** A versão ES ainda usa `activeTab` (estado local) + `state.currentPhase` (contexto) para decidir qual componente renderizar. O mesmo race condition que afetava o PT existe aqui:
1. Usuário clica em CRM → URL vai para `/es/fabrica/crm`
2. `useEffect` chama `setPhase(4)` → `currentPhase = 4`
3. Hidratação do Supabase termina → restaura `currentPhase: 2` (Carrossel)
4. Render mostra Carrossel mesmo com URL `/crm`

**Solução:** Aplicar a mesma refatoração URL-first do `Fabrica.tsx` (commit `ff4c0d7d`):
- Criar `getPhaseFromPath(pathname)` 
- `activePhase = getPhaseFromPath(location.pathname)`
- `activeTab = activePhase > 0 ? "phase" : "dashboard"`
- Render usa `activePhase` em vez de `state.currentPhase`

**Referência:** Ver `src/pages/Fabrica.tsx` (versão PT) como modelo exato.

---

## 🔴 BUG CRÍTICO 2 — Botão "Anuncio" e Admin não chamam `navigate()`

**Arquivo:** `src/pages/FabricaES.tsx` — Linhas 133–137 e 373–377

```tsx
// BUGADO (linha 134):
onClick={() => {
  setPhase(1);
  setActiveTab("phase");
  // ❌ Falta: navigate("/es/fabrica/anuncio")
}}

// BUGADO Admin (linha 373):
onClick={() => {
  setPhase(num);
  setActiveTab("phase");
  // ❌ Falta navigate para URL correta
}}
```

**Impacto:** URL nunca muda → deep links não funcionam → recarregar página quebra.

---

## 🟠 BUG 3 — Texto PT no header ES

**Arquivo:** `src/pages/FabricaES.tsx` — Linha 106

```tsx
// ERRADO:
<div className="text-xs font-black text-white">Fábrica de Viagens</div>
// CORRETO:
<div className="text-xs font-black text-white">Fábrica de Viajes</div>
```

---

## 🟠 BUG 4 — Menu mobile ES sem backdrop

**Arquivo:** `src/pages/FabricaES.tsx` — Linha 272

A versão ES não tem overlay/backdrop ao abrir o menu mobile. Usuário não consegue fechar clicando fora.

**Solução:** Adicionar antes do `{mobileMenuOpen && <div className="menu...">}`:
```tsx
{mobileMenuOpen && (
  <div
    onClick={() => setMobileMenuOpen(false)}
    className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] animate-fadeIn"
  />
)}
```

---

## 🟡 BUG 5 — Imports não utilizados em FabricaES.tsx

**Arquivo:** `src/pages/FabricaES.tsx` — Linhas 10–22

Importados mas nunca usados no JSX:
- `FabricaLibraryES` (linha 10)
- `Zap` (linha 18)
- `FolderOpen` (linha 20)
- `Library` (linha 22)
- `Crown` (linha 13) — usado apenas na tela de upgrade, OK manter

---

## 🟡 BUG 6 — Variável `onPrimaryText` calculada mas nunca usada

**Arquivo:** `src/pages/FabricaES.tsx` — Linha 77

```tsx
const onPrimaryText = getContrastText(state.primaryColor); // Dead code
```

---

## 🟠 BUG 7 — GTM ID placeholder nas sales pages

**Arquivos:**
- `src/pages/SalesPage.tsx` — Linha 330
- `src/pages/SalesPageES.tsx` — Linha 329

```tsx
const gtmId = "GTM-XXXXXX"; // ❌ Placeholder não configurado!
```

Google Tag Manager inativo → sem rastreamento de conversão nas páginas de venda.

---

## ✅ Status
- **Identificados:** 28/07/2026
- **Corrigidos:** Nenhum (aguardando priorização do usuário)
- **Prioridade recomendada:** BUG 1 → BUG 2 → BUG 3 → BUG 4 → BUG 7 → BUG 5/6
