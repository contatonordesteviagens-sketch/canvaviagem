# Registro de Falhas e Contexto: Integração API Hotmart e Problemas de Login

Este documento contém TODO o histórico do problema catastrófico gerado com os bancos de dados e a integração do webhook da Hotmart, para que possamos resolver tudo definitivamente no futuro.

> [!WARNING]
> **LEMBRETE PARA O PRÓXIMO AGENTE:**
> É OBRIGATÓRIO criar uma TRAVA DE SEGURANÇA (safety lock) para garantir que a API da Hotmart sempre envie os dados para o banco de dados oficial e que as variáveis de ambiente (`.env`) jamais sejam sobrescritas apontando para bancos incorretos ou vazios. O sistema não pode ser bugado dessa forma novamente.

## 1. O Problema Original (O que Bugou o Sistema)
O sistema entrou em colapso porque existiam dois bancos de dados no ecossistema e o código foi apontado para o banco errado, causando a perda de acesso de administradores e usuários.

*   **Banco Real e Oficial:** `zdjtcwtakgizbsbbwtgc` (Este é o banco de dados principal do Lovable, que *possui* todos os perfis, assinaturas, usuários e vendas reais).
*   **Banco Falso/Antigo (Onde estava o erro):** `mgdsjxasolxoclchyqdx` (Este banco foi equivocadamente classificado por um agente anterior como o oficial, mas testes confirmaram que ele não possui os acessos atuais).

### Como o Bug Ocorreu:
1. O agente anterior presumiu erroneamente que `mgdsjxasolxoclchyqdx` era o banco oficial e **fez um hardcode** no arquivo `client.ts` apontando para ele.
2. Com isso, todo o sistema (inclusive a verificação de login do Admin `lucashenriquephd@gmail.com`) passou a apontar para o banco `mgdsjxasolxoclchyqdx`.
3. Como os dados reais estavam no banco `zdjtcwtakgizbsbbwtgc`, o login do admin retornava `"Credenciais inválidas ou acesso não autorizado"`.
4. Houve grande confusão com o Webhook da Hotmart: a URL da Hotmart chegou a ser configurada para o banco falso (`mgdsjxasolxoclchyqdx`), o que causou o bloqueio dos clientes que compraram na plataforma, pois eles estavam sendo inseridos no banco que o frontend real não estava lendo.

## 2. Nossas Tentativas e Resoluções (O que foi feito e revertido)
1. **Tentativa de Forçar o Login:** Chegamos a colocar um "bypass" (gambiarra) no `AdminLogin.tsx` para permitir que o email `lucashenriquephd@gmail.com` ignorasse as regras da tabela `user_roles`. **Isso foi REVERTIDO a pedido do dono do sistema.**
2. **Reversão Geral:** O código-fonte (`.env`, `supabase/config.toml`, `client.ts` e `SiteViewer.tsx`) foi completamente restaurado e revertido para apontar novamente para o banco oficial **`zdjtcwtakgizbsbbwtgc`**. Tudo voltou a ser como era antes do agente "bugar" o sistema.
3. **Teste Prático de Login:** Realizamos um teste de login via script diretamente no banco `zdjtcwtakgizbsbbwtgc` com a senha do admin e tivemos **SUCESSO**, comprovando definitivamente que os dados estão lá e intactos. (A falsa impressão inicial de que estava vazio se deu por conta do RLS - Row Level Security, que bloqueia queries anônimas).

## 3. Próximos Passos e Solução Definitiva
Quando formos retomar este problema (ex: "quero vincular e resolver o problema da Hotmart da API"), o agente responsável deverá:

1. Garantir que o Webhook da Hotmart esteja apontado para a API do banco oficial.
2. Criar a trava de segurança exigida pelo proprietário para impedir que deploys sobrescrevam chaves críticas de banco de dados.
3. Verificar a tabela `user_roles` no banco `zdjtcwtakgizbsbbwtgc` e assegurar que o ID do usuário `lucashenriquephd@gmail.com` possua o role de "admin" (caso o login nativo não esteja funcionando).
4. NUNCA realizar hardcode de banco de dados para `mgdsjxasolxoclchyqdx`. O banco da plataforma é e sempre será `zdjtcwtakgizbsbbwtgc`.

## 4. Regra de Negócio Oficial: Planos Stripe vs Hotmart

Este contexto foi confirmado pelo proprietário em 19/06/2026 e deve ser usado como fonte de verdade antes de qualquer alteração em acesso, checkout, webhook, `check-subscription`, `ProtectedRoute`, `fabricaAccess`, `Header`, `MinhaConta` ou páginas de planos.

### Stripe

Na Stripe existem dois grupos de plano:

1. **Plano Start**
   - É a maior parte dos usuários.
   - Valores aproximados observados: R$ 9, R$ 30, R$ 37, R$ 39/mês, conforme oferta/campanha.
   - Deve liberar o **Canva Viagem**.
   - Deve liberar ferramentas base do Canva Viagem: vídeos, artes, histórias/stories, ferramentas de inteligência artificial do painel principal, acervo e recursos protegidos por assinatura comum.
   - NÃO deve liberar a **Fábrica**.

2. **Plano Elite**
   - Valores de referência: aproximadamente R$ 90/mês ou R$ 347/ano.
   - Deve liberar tudo do Plano Start.
   - Também deve liberar a **Fábrica**, incluindo geração de imagens, geração de anúncios e demais ferramentas dentro da rota/área da Fábrica.

### Hotmart

Na Hotmart, para este produto do Canva Viagem, só existe o equivalente ao **Plano Elite**.

- Quem compra o produto correto pela Hotmart deve ter acesso total.
- Deve liberar Canva Viagem + Fábrica + todas as ferramentas incluídas no Elite.
- Não existe Plano Start via Hotmart neste fluxo.
- Produto Hotmart autorizado conhecido: `7876791`.
- O produto Hotmart autorizado deve ser convertido internamente para o produto canonico Elite usado pelo sistema: `hotmart_elite`.

### Regra de Acesso Correta

- **Canva Viagem / painel principal:** liberar para qualquer assinante ativo, seja Start ou Elite, Stripe ou Hotmart.
- **Fábrica / geração de imagens / geração de anúncios / criador de sites / painel marketing Elite:** liberar apenas para:
  - assinante Stripe Elite; ou
  - comprador Hotmart do produto Elite autorizado; ou
  - admin real validado pelo banco.

### Correcao Aplicada Localmente

A regra de plano foi centralizada: `prod_TkvaozfpkAcbpM` ficou como Start; `prod_UTFsXcKq8m0mol`, `prod_UTSmPe3GPt8iHt`, `prod_UTFlCWzNqvqSNx` e `hotmart_elite` ficaram como Elite. A Fabrica agora deve ser liberada apenas para Stripe Elite, Hotmart Elite autorizado ou admin real.

Manter separados explicitamente:

- `START_PRODUCT_IDS`
- `STRIPE_ELITE_PRODUCT_IDS`
- `HOTMART_ELITE_PRODUCT_IDS`
- produto canonico Hotmart Elite: `hotmart_elite`

Arquivos prováveis para revisar:

- `supabase/functions/check-subscription/index.ts`
- `supabase/functions/_shared/fabricaAccess.ts`
- `supabase/functions/_shared/welcomeEmail.ts`
- `supabase/functions/hotmart-webhook/index.ts`
- `src/components/ProtectedRoute.tsx`
- `src/components/Header.tsx`
- `src/pages/MinhaConta.tsx`
- `src/pages/Fabrica.tsx`
- `src/pages/FabricaES.tsx`
- `src/components/canva/BottomNav.tsx`


