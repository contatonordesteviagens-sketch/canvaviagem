# Restaurar a verificação por Magic Link

## Objetivo
Publicar a correção já presente em `verify-magic-link` para eliminar o timeout 504 durante o login por e-mail, sem alterar o frontend ou o banco de dados.

## Estado confirmado
- A função atual não usa mais `auth.admin.listUsers` nem paginação de usuários.
- A identificação do usuário utiliza `generateLink()` e o ID retornado diretamente.
- O endpoint implantado responde, mas precisa ser republicado com o código sincronizado.
- A assinatura Elite da conta verificada está ativa e vinculada ao usuário; o bloqueio relatado ocorre antes, na conclusão da autenticação.

## Execução
1. Publicar somente a Edge Function `verify-magic-link` no backend oficial.
2. Executar uma chamada segura com token inválido para confirmar que a nova versão responde rapidamente e retorna o erro controlado esperado, sem expor nem consumir links reais.
3. Consultar os logs após a publicação para confirmar inicialização e ausência de timeout/erro de runtime.

## Fora do escopo
- Nenhuma migration.
- Nenhuma alteração de arquivo ou novo commit.
- Nenhuma publicação do frontend.
- Nenhuma mudança em planos, produtos ou assinaturas.
