# 🛡️ REGRAS DE OURO — Canva Viagem / Fábrica
## Como mexer no projeto sem quebrar nada

> **Leia isso ANTES de qualquer alteração.**
> Este documento define o que pode ser tocado, o que é intocável, e como agir com segurança.

---

## ❌ ZONA PROIBIDA — NUNCA MEXA NESSES ARQUIVOS

Esses arquivos são o **coração da geração de imagens e do sistema inteiro**.
Qualquer alteração pode quebrar a Fábrica completamente.

| Arquivo | O que faz | Risco |
|---------|-----------|-------|
| `src/lib/fabrica-compose-art.ts` | Motor de composição e geração dos anúncios visuais | 🔴 CRÍTICO |
| `src/lib/fabrica-templates.ts` | Templates de layout das imagens geradas | 🔴 CRÍTICO |
| `src/lib/fabrica-engine.ts` | Engine principal de renderização | 🔴 CRÍTICO |
| `supabase/functions/*/index.ts` | Edge Functions do Supabase (IA, GPT, geração) | 🔴 CRÍTICO |
| `src/lib/site-generator.ts` | Gerador do HTML do site final | 🔴 CRÍTICO |
| `src/hooks/useFabricaState.ts` | Estado global da Fábrica (dados entre fases) | 🟠 ALTO |
| `src/types/fabrica.ts` | Tipos TypeScript da Fábrica | 🟠 ALTO |

### ⚠️ Regra absoluta:
> **Se não foi pedido explicitamente para mexer nesses arquivos → NÃO TOQUE.**

---

## ✅ ZONA SEGURA — Pode ser alterado com cuidado

Esses arquivos controlam **apenas layout e aparência**, não a lógica de geração.

| Arquivo | O que pode mudar |
|---------|-----------------|
| `src/pages/fabrica/Phase3ArtFactory.tsx` | Layout da página PT (posição de cards, grid, CSS) |
| `src/pages/fabrica/Phase3ArtFactoryES.tsx` | Layout da página ES (posição de cards, grid, CSS) |
| `src/pages/fabrica/Phase4LandingBuilder.tsx` | Layout do construtor de site PT |
| `src/pages/fabrica/Phase4LandingBuilderES.tsx` | Layout do construtor de site ES |
| `src/pages/Fabrica.tsx` | Container principal PT (max-width, padding) |
| `src/pages/FabricaES.tsx` | Container principal ES (max-width, padding) |
| `src/pages/SalesPage.tsx` | Página de vendas PT |
| `src/pages/SalesPageES.tsx` | Página de vendas ES |
| Arquivos `*.css` | Estilos globais |

---

## 📋 REGRAS DE TRABALHO SEGURO

### Regra 1 — Só mexe no que foi pedido
Se o usuário pediu para mudar o layout da lateral esquerda,
mexa **apenas** nas `<div>` de container e grid.
**Não toque** em nenhuma função, hook, handler ou lógica.

### Regra 2 — Nunca remova props ou funções existentes
Se um componente recebe `onBack`, `onNext`, `primaryColor` etc,
**mantenha todos eles** mesmo que reorganize o layout.

### Regra 3 — Preserve todos os handlers de evento
Funções como:
- `handleDownload()`
- `handleGenerate()`
- `undo()` / `redo()`
- `toggleSection()`
- `updSite()` / `updPacote()` / `updDepo()`
- `applyGlobalImage()`

**Nunca apague ou renomeie essas funções.** Só mova os botões que as chamam.

### Regra 4 — Não altere o `<iframe>` srcDoc
O `srcDoc={previewHTML}` do iframe é gerado pela engine do site.
Pode mudar **tamanho e classe CSS** do iframe, mas nunca o `srcDoc`.

### Regra 5 — Não altere imports
Não remova nem adicione imports sem necessidade.
Se você move um componente dentro do mesmo arquivo, os imports não mudam.

### Regra 6 — Sempre testar o build antes de fazer push
```powershell
npm run build
```
Se retornar **erro → NÃO faz push**. Corrija primeiro.
Se retornar **"built in Xs" → pode fazer push com segurança**.

### Regra 7 — Nunca faça push com erros TypeScript
Erros de tipagem podem quebrar a build na Lovable mesmo que pareça funcionar local.

---

## 🔍 O QUE VERIFICAR ANTES DE ALTERAR QUALQUER COISA

Antes de editar um arquivo, responda:

1. **O usuário pediu explicitamente essa mudança?**
   - Não → não mexa

2. **A mudança é só de layout/CSS?**
   - Sim → pode prosseguir com cuidado
   - Não → reavalie se é necessário

3. **Alguma função ou lógica vai ser afetada?**
   - Sim → revise duas vezes antes de salvar

4. **O arquivo está na zona proibida?**
   - Sim → pare, não altere

---

## 🏗️ ARQUITETURA RESUMIDA DA FÁBRICA

```
Fábrica (4 Fases)
│
├── Fase 1 — Dados da agência (nome, logo, WhatsApp)
├── Fase 2 — Destinos e pacotes
├── Fase 3 — GERAÇÃO DE IMAGENS ← ⚠️ coração do sistema
│   ├── Phase3ArtFactory.tsx       (UI em PT)
│   ├── Phase3ArtFactoryES.tsx     (UI em ES)
│   └── fabrica-compose-art.ts    ← 🔴 NUNCA MEXA
│
└── Fase 4 — Construtor de Site
    ├── Phase4LandingBuilder.tsx   (UI em PT)
    ├── Phase4LandingBuilderES.tsx (UI em ES)
    └── site-generator.ts          ← 🔴 NUNCA MEXA
```

---

## 🚨 SE ALGO QUEBRAR

### Passo 1 — Veja o erro
```powershell
npm run build 2>&1 | head -50
```

### Passo 2 — Desfaça a última alteração
```powershell
# Ver o que mudou
git diff

# Desfazer tudo que ainda não foi commitado
git checkout -- .
```

### Passo 3 — Voltar ao último commit estável
```powershell
# Ver histórico
git log --oneline -5

# Voltar para um commit específico (substitua HASH pelo código)
git reset --hard HASH
```

### Passo 4 — Nunca force push em pânico
```powershell
# ❌ NÃO FAÇA ISSO com código quebrado:
git push origin main --force

# ✅ Sempre corrija localmente primeiro, DEPOIS faça push
```

---

## ✅ CHECKLIST ANTES DE CADA PUSH

- [ ] `npm run build` passou sem erros?
- [ ] Só mexi nos arquivos que foram pedidos?
- [ ] Não removi nenhuma função ou handler?
- [ ] Não toquei em nenhum arquivo da zona proibida?
- [ ] O commit tem uma mensagem descritiva?

Se todas as respostas forem **SIM** → pode fazer push com segurança. 🚀
