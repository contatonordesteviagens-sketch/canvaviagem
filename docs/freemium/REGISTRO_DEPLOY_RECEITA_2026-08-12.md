# Canva Viagem — Registro do sistema de receita, freemium e administração

Data: 12 de agosto de 2026  
Status: publicado em produção, com uma pendência complementar de Storage  
Produção: https://canvaviagem.com  
Backend: Lovable Cloud gerenciado pela Lovable, projeto subjacente `zdjtcwtakgizbsbbwtgc`

## Objetivo do trabalho

Corrigir a liberação gratuita indevida da Fábrica, restaurar a passagem obrigatória pelo Stripe para o teste Elite, criar uma experiência de aquisição com prévia antes do cadastro e ampliar o painel administrador com dados reais de uso, sites, leads e pagamentos.

## Diagnóstico encontrado

O controle de créditos já existia parcialmente no servidor, mas havia sido desconectado das ações de gerar e baixar anúncios e carrosséis. Isso permitia uso gratuito além da cota esperada.

Também foram encontrados estes riscos:

- checkout Elite direto por Payment Links em algumas páginas, contornando o checkout central;
- prévias completas presentes no navegador e apenas escondidas com blur visual;
- sites que poderiam permanecer ativos depois da perda do plano Elite;
- webhooks Stripe sem proteção completa contra duplicação e ordem invertida;
- busca de fotos com rate limit somente em memória;
- painel administrativo com métricas incompletas ou inconsistentes;
- falta de sinalização de múltiplas contas usando o mesmo dispositivo/rede;
- bucket público configurado para aceitar HTML, criando um canal lateral de hospedagem.

## Funil definido

### Visitante sem conta

1. Pode entrar na Fábrica sem login.
2. Pode informar destino, agência, logo, preço, cores e demais dados.
3. Pode pesquisar imagens, com limite de requisições no servidor.
4. Ao solicitar a geração, recebe somente uma prévia deliberadamente degradada.
5. A arte final, o carrossel completo e o HTML integral do site não são entregues ao navegador guest.
6. Após aproximadamente 10 segundos, aparece a solicitação para criar conta.

### Conta gratuita

- Limite de 3 downloads de anúncios.
- Limite de 1 download de carrossel.
- Site não pode ser publicado.
- Consumo registrado de forma transacional no servidor.
- Cota associada ao usuário, fingerprint do navegador e sinal servidor/rede.

### Teste Elite

- Duração: 3 dias.
- Cartão obrigatório no Stripe.
- Cobrança automática depois do período, salvo cancelamento.
- Checkout criado somente pelo backend autenticado.
- A tela de sucesso não concede acesso por conta própria.
- Acesso é atualizado pelo estado real da assinatura recebido nos webhooks.
- Trial anterior é verificado no banco e no histórico do Customer Stripe.
- Nova tentativa de trial é bloqueada por e-mail normalizado e fingerprint do cartão quando disponível.

### Assinante Elite

- Fábrica e recursos Elite liberados conforme entitlement do servidor.
- Publicação de site permitida.
- Site permanece público apenas enquanto a conta mantém acesso elegível.

## Segurança e cobrança implementadas

- Checkout central para a oferta Elite.
- `payment_method_collection=always`.
- Idempotência na criação da sessão de checkout.
- Associação de `user_id`, origem da oferta e ciclo em metadata.
- Processamento idempotente de webhooks por `event.id`.
- Consulta do objeto atual da assinatura no Stripe para evitar reativação por eventos atrasados.
- Suspensão automática de sites quando o acesso deixa de ser elegível.
- Suspensão manual pelo administrador sem apagar os dados.
- Rate limit persistente para pesquisa de fotos.
- Registro de sinais de múltiplas contas.
- Proteção contra fórmulas maliciosas na exportação CSV do administrador.
- Payment Link Elite antigo da live substituído pelo checkout central.

## Painel administrador

Nova área: `/admin/users` — “Usuários e sites”.

Informações disponíveis:

- nome, e-mail, telefone e origem;
- plano e status da assinatura;
- ciclo, término do período e término do trial;
- quantidade de projetos;
- anúncios e carrosséis gerados/baixados;
- sites totais e ativos;
- visitas, cliques, leads e taxa de conversão;
- última atividade;
- sites individuais com opção de suspender ou reativar;
- exportação CSV;
- sinais de possível repetição do trial em várias contas.

Filtros disponíveis:

- todos os planos;
- Elite;
- Start;
- inativos/gratuitos;
- teste vencido;
- usuários com site;
- usuários com site ativo;
- usuários com leads;
- somente alertas.

Alertas administrativos:

- pagamento pendente;
- site ativo sem Elite;
- tráfego em site sem Elite;
- leads em conta sem Elite;
- possível repetição do teste em múltiplas contas.

Observação: assinaturas, sites e leads são dados do servidor. Gerações e downloads pagos são telemetria operacional e não devem ser tratados como registro financeiro auditável.

## Banco e migration

Migration principal:

`supabase/migrations/20260812120000_revenue_guard_admin_intelligence.sql`

Aplicada no backend `zdjtcwtakgizbsbbwtgc` pelo Lovable Cloud.

Principais objetos adicionados ou alterados:

- colunas `is_active`, `suspended_at` e `suspension_reason` em `public_sites`;
- `fabrica_abuse_signals`;
- `fabrica_rate_limits`;
- `fabrica_trial_claims`;
- `stripe_webhook_events`;
- `server_fingerprint` em `fabrica_usage_ledger`;
- `sync_user_public_site_access`;
- `admin_set_public_site_status`;
- `admin_user_intelligence`;
- RPCs de rate limit, trial, cotas e idempotência de webhook.

## Funções publicadas

- `create-checkout`
- `fabrica-entitlements`
- `fabrica-search-photos`
- `stripe-webhook`

As quatro responderam `HTTP 200` na verificação externa de disponibilidade.

## GitHub e Lovable

O trabalho foi rebaseado sobre a versão mais recente do GitHub antes da publicação, preservando mudanças feitas por outros agentes.

Commits após o rebase:

- `cb84613e` — proteger funil gratuito e controle de receita;
- `589c0790` — fechar atalhos de preview e trial.

Publicação realizada em:

- repositório principal: `contatonordesteviagens-sketch/canvaviagem-6647054a`;
- repositório conectado ao Lovable: `contatonordesteviagens-sketch/canvaviagem`.

O Lovable informou que o workspace publicado já continha `589c0790` como ancestral direto e disparou o frontend em produção.

## Validações executadas

- TypeScript `npx tsc --noEmit`: aprovado.
- Build Vite de produção: aprovado, 5.913 módulos transformados.
- Contrato freemium: aprovado — 1 projeto, 3 anúncios e 1 carrossel.
- Roteador público de sites: 15 testes aprovados.
- `/inicio` e `/fabrica`: `HTTP 200` em produção.
- As quatro Edge Functions: disponíveis.
- Novo asset de frontend detectado após a publicação.
- Consulta anônima aos sites retornou `401`, comportamento compatível com o endurecimento de acesso.

## Pendência complementar

O Lovable aplicou toda a migration, exceto a alteração direta de `storage.buckets`, pois a plataforma não permite essa escrita em migration.

Pendente aplicar pela ferramenta de Storage:

- bucket: `thumbnails`;
- permitir somente `image/png`, `image/jpeg` e `image/webp`;
- remover `text/html` dos MIME types aceitos;
- não apagar ou alterar arquivos existentes.

Essa pendência não invalida o funil, checkout ou cotas, mas fecha um canal lateral de upload de HTML e deve ser concluída antes de considerar o endurecimento totalmente encerrado.

## Checklist operacional antes de escalar tráfego

- [x] Frontend publicado.
- [x] Migration de receita aplicada.
- [x] Edge Functions publicadas.
- [x] Build e TypeScript aprovados.
- [x] Cotas gratuitas ligadas aos downloads.
- [x] Site restrito ao Elite.
- [x] Checkout Elite centralizado.
- [x] Webhooks idempotentes.
- [x] Painel administrativo criado.
- [ ] Remover `text/html` do bucket `thumbnails` pela ferramenta de Storage.
- [ ] Fazer um teste real ponta a ponta com novo e-mail e cartão controlado.
- [ ] Confirmar criação da assinatura `trialing`, acesso imediato e data exata da cobrança.
- [ ] Cancelar o teste e confirmar revogação/suspensão automática.
- [ ] Confirmar que uma segunda tentativa com o mesmo cartão não ganha outro trial.

## Decisões importantes

1. O backend não foi trocado nem migrado.
2. O projeto `mgdsjxasolxoclchyqdx` enviado posteriormente não pertence ao Canva Viagem atual e estava sem as tabelas principais da plataforma.
3. A produção continua no Lovable Cloud, projeto subjacente `zdjtcwtakgizbsbbwtgc`.
4. Nenhuma credencial, token ou chave secreta foi registrada neste documento.
5. Tokens compartilhados durante a conversa devem ser revogados e recriados.

## Sincerão

Não existe garantia literal de que um sistema gratuito seja “impossível de burlar”. O desenho atual elimina os atalhos óbvios, não entrega o produto final ao visitante sem conta, controla consumo no servidor, cruza sinais de abuso e torna fraude repetida mais cara e visível. Identidade absolutamente única exigiria verificação adicional de identidade, telefone ou organização e aumentaria bastante a fricção de conversão.

## Próxima ação recomendada

Concluir a restrição MIME do bucket e executar o teste real ponta a ponta. Se passar, iniciar vendas com volume controlado e acompanhar diariamente:

- início de checkout;
- checkout concluído;
- trials iniciados;
- conversão trial → pagamento;
- falhas de cobrança;
- contas sinalizadas por repetição;
- sites suspensos;
- geração e download por usuário.

