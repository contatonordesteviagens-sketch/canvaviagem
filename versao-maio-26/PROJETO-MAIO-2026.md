# Canva Viagem — Versão Maio 2026

## Status
Sessão iniciada: 2026-04-24

## GitHub
- Repo atual: https://github.com/contatonordesteviagens-sketch/canvaviagem
- Transferência pendente para: lucasferraripro (fazer depois, etapa separada)
- Deploy: Vercel (automático via push)
- Stack: React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Supabase

## O que foi feito nesta versão

### 1. Redesign completo de Planos.tsx
- Hero novo: fundo zinc-950, gradiente sky→violet, stats row, CTAs duplos
- Testimoniais com initials coloridos
- Pricing em 3 colunas: Gratis / Pro / Elite
- Tabela comparativa expandida (4 colunas incluindo Elite)
- FAQ atualizado com pergunta sobre Elite vs Pro
- CTA final com dois botoes (Pro + Elite)
- Sticky bottom bar no mobile (aparece apos 600px de scroll)

### 2. Novo Plano Elite
- Preco: R$67/mes ou R$497/ano (R$41/mes)
- Diferenciais sobre Pro: Scripts Meta Ads, Templates WhatsApp Business, Conteudo em Espanhol, Grupo VIP
- Stripe links: placeholders (criar no Stripe Dashboard e substituir em STRIPE.elite_monthly e STRIPE.elite_annual)
- Upsell card para assinantes Pro existentes na tela de "ja assinante"

## Proximos passos

### Imediato (antes de publicar)
- [ ] Criar produtos Elite no Stripe Dashboard
- [ ] Substituir os placeholders #elite-checkout-mensal e #elite-checkout-anual pelos links reais
- [ ] Testar no mobile (Safari iOS + Chrome Android)
- [ ] Commitar e push para GitHub (Vercel faz deploy automatico)

### Curto prazo
- [ ] Email para base atual de assinantes apresentando o plano Elite
- [ ] Post no Instagram sobre o lancamento do Elite
- [ ] Transferir repo para conta lucasferraripro

### Transferencia de GitHub
Quando pronto:
1. GitHub > Settings > Transfer Ownership > contatonordesteviagens-sketch/canvaviagem -> lucasferraripro
2. Atualizar Vercel para apontar para o novo repo
3. Atualizar CLAUDE.md com o novo URL do repo

## Favoritados 21st.dev
Hash dos favoritos: 4db8454a72ef015f318661049a4e195e0f508242bf3c914ec8a1d13b810e007d
URL: https://21st.dev/s/4db8454a72ef015f318661049a4e195e0f508242bf3c914ec8a1d13b810e007d
(Acessar com login para ver os componentes especificos e aplicar mais detalhes de design)

## Precos dos planos
| Plano   | Mensal    | Anual           | Stripe link       |
|---------|-----------|-----------------|-------------------|
| Pro     | R$29/mes  | R$197/ano       | links ja existem  |
| Elite   | R$67/mes  | R$497/ano       | CRIAR NO STRIPE   |
