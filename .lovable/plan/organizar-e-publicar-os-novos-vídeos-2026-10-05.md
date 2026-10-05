# Organizar e publicar os novos vídeos

## Objetivo
Publicar os 12 vídeos em português, com link editável, download correto, categoria, legenda e selo **Novo**, sem deixar cópias repetidas na biblioteca.

## Organização do conteúdo
- Cadastrar como **Sazonal**:
  - 5 Feriados do Fim do Ano — usar a legenda enviada e a pasta `FERIADOS` do Drive.
  - Mês das Crianças — Inverno — usar a pasta compartilhada de vídeos novos.
  - Mês das Crianças — Verão — usar a mesma pasta compartilhada.
- Cadastrar como **Vídeo / Nacional**:
  - Porto Seguro
  - Trancoso
  - O que fazer no Ceará
  - Porto de Galinhas
  - 3 lugares do Rio de Janeiro
  - Rio Grande do Norte
  - Alter do Chão
  - Maceió
  - Genipabu
- Definir idioma português, manter todos ativos e marcar todos como novidade.

## Unificação segura dos duplicados
- Auditar a biblioteca por **URL editável do Canva exatamente igual**; não juntar vídeos apenas porque os títulos se parecem.
- Para cada URL repetida, escolher um único cadastro principal e combinar nele os melhores dados existentes: título, categoria, legenda, link do Drive, destaque e estado ativo.
- Antes de remover a cópia, transferir para o cadastro mantido referências do calendário, favoritos e histórico de cliques, preservando o uso já registrado.
- Manter somente um cadastro por link do Canva. A análise já confirmou duplicidade nos oito links antigos enviados; os quatro links restantes ainda não estão cadastrados.
- Fazer uma conferência final para garantir que nenhuma URL da lista permaneceu duplicada.

## Legendas e downloads
- Preservar as legendas existentes que já estejam adequadas.
- Aplicar integralmente a legenda fornecida ao vídeo “5 Feriados do Fim do Ano”.
- Criar legendas em português, com hashtags, apenas para vídeos que continuarem sem legenda.
- Associar os links de Drive informados aos vídeos correspondentes; Inverno e Verão usarão a mesma pasta, conforme aprovado.
- Onde o vídeo antigo já tiver um link individual de Drive válido, preservá-lo durante a consolidação.

## Selo de novidade
- Marcar os 12 vídeos com o campo de novidade.
- Ajustar a exibição para respeitar esse campo em todas as áreas da versão portuguesa, evitando que apenas os três registros mais recentes recebam o selo.
- Não alterar conteúdos ou a experiência da versão espanhola.

## Validação e publicação
- Conferir no banco: 12 URLs únicas, idioma, tipo, categoria, legenda, Drive, status ativo e novidade.
- Testar na versão portuguesa os botões **Editar**, **Legenda** e **Baixar**, incluindo os dois vídeos que compartilham a mesma pasta.
- Confirmar que os assinantes continuam seguindo as regras atuais de acesso e que nenhuma permissão é ampliada.
- Publicar a atualização visual necessária para o selo e validar a versão publicada.

## Detalhes técnicos
- As alterações de conteúdo serão feitas diretamente nas tabelas existentes `content_items`, `captions`, `calendar_entries`, `user_favorites` e `content_clicks`, sem mudança de estrutura.
- A consolidação será transacional: referências serão remapeadas antes da remoção de duplicatas.
- Nenhum lead, assinatura, site ou regra de autenticação será alterado.
