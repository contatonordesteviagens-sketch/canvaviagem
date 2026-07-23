# ⛔⛔⛔ REGRA DE PRIORIDADE MÁXIMA — LER ANTES DE QUALQUER AÇÃO ⛔⛔⛔

> **Todo agente de IA que trabalhar neste projeto (`CANVA E FABRICA - JUNHO 26`) DEVE ler e obedecer estas regras ANTES de tocar em qualquer arquivo de código.**
> Se você é um agente de IA: pare, leia tudo aqui, e nunca ignore estas regras.

---

## 🔐 CARTEIRA DE CLIENTES (CRM) — DADO SAGRADO / INTOCÁVEL

Os leads dos usuários são o **bem mais valioso de toda a plataforma**.
Cada lead é um cliente real de um agente de viagem real.
**Perder, ocultar ou misturar esses dados é inadmissível. Nunca pode acontecer.**

### ⛔ PROIBIÇÕES ABSOLUTAS — JAMAIS FAÇA ISSO:

| Ação proibida | Por quê é crítico |
|---|---|
| Deletar linhas da tabela `crm_form_submissions` | São dados de clientes reais, sem recuperação |
| Dropar ou truncar `crm_form_submissions` | Destruição irreversível de negócio |
| Remover o `fetchRealMetrics` em `Phase5Dashboard.tsx` | Quebra a visualização de todos os leads |
| Substituir `leadsList` por `[]` em caso de erro de fetch | Oculta dados que existem no banco |
| Exibir "Nenhum lead" enquanto `loading=true` ou `fetchError=true` | Falso negativo — dados existem |
| Adicionar botão "Excluir Lead" na UI | Leads são permanentes (append-only) |
| Alterar ou remover `.eq("owner_id", user.id)` no fetch | Quebra o isolamento entre agências |
| Misturar leads de agências diferentes | Cada conta vê APENAS seus próprios leads |
| Refatorar o CRM sem validar TypeScript antes do push | Risco de quebra silenciosa em produção |

---

## ✅ COMO OS DADOS FUNCIONAM (ARQUITETURA)

```
Tabela Supabase: crm_form_submissions
├── owner_id  = user.id   ← isolamento garantido por RLS (Row Level Security)
├── form_id   = projectId ← identifica o site/projeto da agência
├── payload   = { nome, whatsapp, email, destino, datas, obs }
└── status    = fase do lead (novo / contato / proposta / venda / perda)

Tabela Supabase: analytics_events (leads LEGADOS / históricos)
├── event_type = "lead_captured"
├── event_data.agency_id = user.id
└── Marcados como legacy_unverified=true na UI — não entram no total oficial
```

**Cada agência tem seu `user.id` único. O Supabase RLS garante que uma conta nunca veja os dados de outra.**

---

## ✅ CHECKLIST OBRIGATÓRIO ao editar `Phase5Dashboard.tsx`

Antes de qualquer push que toque neste arquivo:

- [ ] `setLeadsList(allLeads)` ainda está presente no fetch — NÃO foi removido
- [ ] `fetchError` é usado como estado separado — quando falha, `leadsList` não é zerado
- [ ] O ternário JSX da tabela está fechado corretamente: `filteredLeads.length === 0 && !loading && !fetchError ? (...) : (...)`
- [ ] O `)}` de fechamento do ternário está antes do `</div>` externo da "Carteira de Clientes"
- [ ] `npx tsc --noEmit` rodou sem erros antes do commit
- [ ] Nenhum botão de delete foi adicionado na tabela de leads

---

## 📁 ARQUIVOS PROTEGIDOS — só mexa com aprovação explícita do usuário

| Arquivo | O que é | Nível de risco |
|---|---|---|
| `src/pages/fabrica/Phase5Dashboard.tsx` | CRM completo + fetch de leads + carteira | 🔴 CRÍTICO |
| `src/lib/fabrica-crm-publication.ts` | Resolve o form_id por projeto | 🟡 ALTO |
| `supabase/migrations/` | Estrutura do banco | 🔴 CRÍTICO |
| `.agents/AGENTS.md` | Este arquivo de regras | 🔴 NÃO EDITAR SEM MOTIVO |

---

## 🎨 PADRÃO DE DESIGN DA FÁBRICA

- **Sidebar:** somente ícones Lucide — emojis `🖼️📄👥` são PROIBIDOS
- **CRM:** design minimalista — sem badges coloridos excessivos (AO VIVO / INTERAÇÃO / AGUARDANDO), sem barras animadas estáticas falsas
- **Sidebar scrollbar:** `[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden` obrigatório em ambos `Fabrica.tsx` e `FabricaES.tsx`

---

## 📂 CAMINHOS DO PROJETO

| Projeto | Caminho local | Stack |
|---|---|---|
| Canva Viagem / Fábrica | `C:\Users\win 10\Desktop\CANVA E FABRICA - JUNHO 26` | React + Vite + TypeScript + Tailwind |
| Email Marketing | `C:\Users\win 10\email marketing` | HTML + Node.js |
| Fábrica Isolada (imagens) | `C:\Users\win 10\Desktop\FABRICA_ISOLADA` | Canvas/TypeScript |

**Deploy:** `git push` para `contatonordesteviagens-sketch/canvaviagem` → branches `main` e `master` (Lovable)

**Comando de validação antes de todo push:**
```powershell
cd "C:\Users\win 10\Desktop\CANVA E FABRICA - JUNHO 26"
npx tsc --noEmit
```
