# Corrigir o acesso instável de assinantes Stripe sem abrir a plataforma

## Diagnóstico confirmado

- O usuário `contatoadm@agenciafaroldocabo.com.br` existe e está autenticando normalmente.
- O perfil está vinculado ao cliente Stripe `cus_VKKhPQfiWZLBZl`, mas não há uma assinatura persistida para esse usuário na tabela de assinaturas.
- A imagem mostra uma assinatura Stripe em **avaliação até 25/10/2026**, com três itens de plano na mesma assinatura.
- A verificação do link aceita Stripe com estado `active` **ou** `trialing`, libera a sessão e mostra a confirmação Elite.
- Segundos depois, `check-subscription` revalida a conta, mas procura apenas assinaturas `active`. Como a assinatura real está `trialing`, ela não é encontrada; a função invalida o registro local e a proteção de rota envia o usuário para `/inicio`.
- Há um segundo defeito relacionado: as rotinas do Stripe usam apenas o primeiro item da assinatura. Em uma assinatura com vários itens, isso pode classificar o plano errado, embora exista um produto Elite válido.

## Correção proposta

1. **Centralizar a classificação segura de assinaturas Stripe**
   - Examinar todos os itens da assinatura, não apenas o primeiro.
   - Aceitar somente IDs explicitamente conhecidos como Start ou Elite.
   - Se houver mais de um produto reconhecido, escolher o maior direito válido: Elite antes de Start.
   - Rejeitar produtos desconhecidos; nunca transformar “qualquer assinatura Stripe” em acesso pago.

2. **Unificar os estados que concedem acesso**
   - Considerar `active` e `trialing` somente quando o produto for reconhecido e o período correspondente ainda estiver vigente.
   - Para `trialing`, exigir `trial_end` futuro.
   - Continuar bloqueando `canceled`, `past_due`, `unpaid`, `paused`, `incomplete` e períodos vencidos.
   - Isso reconhece uma avaliação já existente no Stripe, mas não cria novos testes gratuitos nem libera contas sem assinatura.

3. **Aplicar a mesma regra em toda a cadeia**
   - `verify-magic-link`: gravar o estado real (`active` ou `trialing`), o produto reconhecido e as datas reais; remover o `status: "active"` artificial.
   - `check-subscription`: localizar `active` ou `trialing`, classificar todos os itens e não cancelar uma assinatura local válida só porque o Stripe respondeu `trialing`.
   - `stripe-webhook`: sincronizar o produto reconhecido entre todos os itens nos eventos de criação, atualização e pagamento.
   - `fabrica-entitlements` e o cache do navegador: usar a mesma validade de estado/período, sem ampliar permissões por falha de rede.

4. **Preservar a separação dos planos**
   - Start reconhecido: acesso ao Canva Viagem conforme as permissões Start, sem Fábrica.
   - Elite reconhecido: acesso ao Canva Viagem e à Fábrica.
   - Gratuito, produto desconhecido, assinatura vencida ou inadimplente: permanece bloqueado.
   - Administrador mantém o bypass atual; nenhuma regra de segurança ou política de dados será afrouxada.

5. **Recuperar esta conta de forma vinculada e auditável**
   - Depois da correção, ressincronizar apenas o usuário autenticado pelo `user_id`, e-mail normalizado e cliente Stripe já ligado ao perfil.
   - Confirmar que a assinatura Stripe válida foi persistida com produto, estado e vencimento corretos.
   - Não realizar liberação manual genérica nem alterar outros usuários.

6. **Testes de regressão e validação real**
   - Cobrir: Elite `active`, Elite `trialing` vigente, Start `active`, Start `trialing` vigente, produto desconhecido, trial vencido, cancelado e inadimplente.
   - Cobrir assinatura com vários itens e garantir que Elite prevaleça sobre Start sem aceitar itens desconhecidos.
   - Testar a sequência completa: link por e-mail → confirmação Elite → entrada na plataforma → espera/revalidação → permanência na área assinante → abertura da Fábrica.
   - Testar Start e conta grátis para comprovar que a correção não abriu a Fábrica nem a plataforma para quem não tem direito.

## Arquivos previstos

- `supabase/functions/_shared/planAccess.ts`
- `supabase/functions/check-subscription/index.ts`
- `supabase/functions/verify-magic-link/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/fabrica-entitlements/index.ts`
- `src/contexts/AuthContext.tsx`
- `scripts/validate-paid-access-contract.mjs`
- `AGENTS.md` para registrar a regra única de classificação e evitar regressões futuras

## Publicação

- Publicar somente as funções alteradas após os testes.
- Publicar o frontend somente se a correção do cache exigir alteração nele.
- Validar a conta afetada e os cenários Start/Elite/grátis antes de considerar concluído.
