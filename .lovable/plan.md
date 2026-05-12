## Diagnóstico do que está acontecendo

Encontrei 3 problemas reais no fluxo, e eles explicam melhor o erro do que “tempo de expiração”:

1. **O envio do magic link por e-mail está falhando agora**
   - Os logs mostram erro 403 no envio: o domínio `canvaviagem.com` não está verificado para envio via e-mail.
   - Resultado: o token é criado no banco, mas o comprador não recebe o e-mail.
   - Depois de algumas tentativas, o usuário ainda bate no rate limit de magic link.

2. **O plano Start está hardcoded como fallback em vários pontos**
   - O backend usa `prod_TkvaozfpkAcbpM` como produto padrão.
   - No banco, 46 assinaturas ativas estão gravadas como esse produto Start, enquanto só 2 aparecem como Elite.
   - Isso confirma sua suspeita: quando a identificação do produto falha, o sistema cai no plano básico.

3. **A tabela de perfis está vazia, mas assinaturas existem**
   - Existem assinaturas na tabela `subscriptions`, mas `profiles` retornou vazio.
   - Isso quebra consultas que dependem de perfil para achar e-mail/nome pelo cliente Stripe.
   - Também vi que as assinaturas não retornam e-mail no join, então parte do fluxo está salvando assinatura sem perfil vinculado corretamente.

## Como eu vou corrigir

### 1. Blindar o webhook de pagamento
- Atualizar o fluxo do `stripe-webhook` para nunca depender do fallback Start quando a compra vier do link Elite.
- Extrair o produto de forma mais robusta nesta ordem:
  1. assinatura Stripe
  2. line items do checkout
  3. invoice lines
  4. metadata do checkout, se existir
- Se ainda não conseguir identificar o produto, registrar erro claro e não fingir que é Start.

### 2. Corrigir criação de usuário, perfil e assinatura
- Garantir que toda compra crie/atualize:
  - usuário
  - perfil com e-mail
  - assinatura com `stripe_customer_id`, `stripe_subscription_id`, `product_id` real e status
- Corrigir o caminho onde `profiles` não está sendo preenchido.

### 3. Corrigir o check de assinatura
- Ajustar `check-subscription` para não tratar o produto Start como “não premium” de forma errada.
- Devolver também o `product_id` real para o frontend diferenciar Start e Elite.
- Garantir que Elite seja reconhecido pelos IDs existentes:
  - `prod_UTFlCWzNqvqSNx`
  - `prod_UTFsXcKq8m0mol`
  - `prod_UTSmPe3GPt8iHt`

### 4. Corrigir envio do magic link
- Trocar o remetente do magic link para um domínio/remetente que realmente esteja autorizado no sistema atual, ou preparar o projeto para usar o e-mail gerenciado pelo Lovable Cloud.
- Fazer o backend retornar erro real quando o e-mail não for enviado, para não parecer que “enviou com sucesso”.
- Evitar rate limit injusto quando o erro foi causado por falha de envio.

### 5. Recuperação dos usuários já afetados
- Fazer uma leitura dos clientes/assinaturas recentes e identificar quem comprou Elite mas ficou salvo como Start ou sem perfil.
- Atualizar os registros afetados no banco para o plano correto.
- Gerar novos links válidos para esses usuários depois que o envio estiver corrigido.

### 6. Validação final
- Verificar logs do envio de e-mail.
- Verificar registros novos em `magic_link_tokens` e `email_events`.
- Verificar que assinaturas Elite entram com produto Elite no banco.
- Testar a verificação do magic link até criar sessão e retornar `subscribed: true` com o `product_id` correto.

## Arquivos que pretendo alterar

- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/check-subscription/index.ts`
- `supabase/functions/send-magic-link/index.ts`
- possivelmente `supabase/functions/create-subscription/index.ts`, se esse checkout ainda estiver sendo usado em algum ponto do app

## Observação importante

A causa mais urgente agora é o envio de e-mail: o log mostra que o e-mail não está saindo por falha de domínio. Mas isso não é o único problema; também há uma falha estrutural de identificação de produto que pode rebaixar Elite para Start.