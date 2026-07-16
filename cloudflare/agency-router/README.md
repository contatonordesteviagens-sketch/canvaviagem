# Roteador wildcard dos sites Canva Viagem

Este diretório documenta e endurece o Worker que já atende todas as agências por uma única rota:

```text
*.canvaviagem.com/* → Worker → Supabase public_sites → HTML publicado
```

Ele não cria um domínio por agência, não lê o formulário e não grava dados pessoais. O hostname fornece o slug; o Worker busca somente `html` e `locale` da linha pública correspondente. Caminhos como `/pacote/<slug>` recebem o mesmo HTML, que abre o pacote correto no navegador.

## Estado real auditado

Em 16 de julho de 2026, o painel Cloudflare confirmou que a rota `*.canvaviagem.com/*` **já existe** e aponta para o Worker `dry-snowflake-d942`. Portanto, não se deve criar uma segunda rota wildcard. O ambiente `production` deste diretório usa o mesmo nome para atualizar o Worker existente sem trocar a associação da rota.

O Worker ativo anterior já consultava `public_sites` diretamente. Esta versão apenas endurece esse mesmo desenho: valida host, protege reservados, rejeita escrita e assets inexistentes, trata falhas do Supabase e lê credenciais via configuração em vez de colocá-las no código.

Os hosts reservados `www`, `app`, `admin`, `api`, `painel`, `blog` e `sites` também são encaminhados ao aplicativo principal caso a rota wildcard os capture. Eles nunca recebem identidade de agência; hosts externos, aninhados ou com slug inválido continuam respondendo `404`.

## Publicação segura em duas etapas

1. Autenticar com `npx wrangler login`. Nunca salvar token em arquivo ou comando versionado.
2. Registrar a versão ativa com `npx wrangler deployments list --name dry-snowflake-d942` para permitir rollback.
3. Configurar `SUPABASE_ANON_KEY` como secret no ambiente de prévia; ela é uma chave pública, mas não precisa ser duplicada no Git.
4. Fazer o teste isolado: `npx wrangler deploy --config cloudflare/agency-router/wrangler.jsonc`.
5. Abrir `<url-workers.dev>/__health`, testar um slug conhecido e confirmar `404` para um slug inexistente.
6. Conferir no painel que a única rota wildcard continua apontando para `dry-snowflake-d942` e revisar hosts reservados.
7. Configurar o secret também em `production` e somente então executar `npx wrangler deploy --config cloudflare/agency-router/wrangler.jsonc --env production`.
8. Testar um site existente, a raiz do subdomínio e `/pacote/<slug>`. Em regressão, usar rollback para a versão registrada; não apagar a rota wildcard.

## Migração futura

O app principal pode continuar em sua origem atual sem participar da entrega dos sites das agências. Uma migração futura pode usar Cloudflare Workers Static Assets, mas deve preservar o contrato `slug → public_sites`. Não usar Cloudflare Pages por agência, pois custom domains wildcard não são suportados.

## Segurança

- Não colocar token, Account ID, Zone ID ou credenciais neste diretório.
- O token compartilhado em conversa deve ser revogado e substituído antes do deploy.
- Não habilitar logs de corpo, query sensível, cookies ou formulário.
- Não executar o script legado `deploy.ps1`, pois ele contém push forçado.
