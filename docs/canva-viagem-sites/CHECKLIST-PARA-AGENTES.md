# Checklist para agentes — sites do Canva Viagem

Use este checklist antes de editar qualquer código relacionado à Fábrica, templates, publicação, domínios, pacotes ou formulário.

## 1. Antes de começar

- [ ] Li o [README](./README.md) e o documento específico da tarefa.
- [ ] Confirmei qual repositório, branch e versão remota são os mais recentes.
- [ ] Verifiquei alterações locais do usuário e não vou sobrescrevê-las.
- [ ] Identifiquei o contrato de dados compartilhado pelos templates.
- [ ] Identifiquei o formulário principal e o caminho até o CRM.
- [ ] Separei fatos confirmados de hipóteses de infraestrutura.
- [ ] Não copiei credenciais de chat, print, terminal ou arquivo local para o código.

## 2. Regras invioláveis

- [ ] Não substituir, duplicar ou “simplificar” o formulário integrado.
- [ ] Não alterar o destino do CRM sem autorização e teste ponta a ponta.
- [ ] Não quebrar o isolamento entre contas/agências.
- [ ] Não tornar novos campos obrigatórios para pacotes antigos.
- [ ] Não criar fonte de verdade diferente para cada template.
- [ ] Não reativar Vercel; ela é histórica e obsoleta neste fluxo.
- [ ] Reconheço Lovable como origem identificada do app/Fábrica, não como origem dos sites públicos das agências.
- [ ] Não armazenar segredo, token ou chave de serviço no repositório.

## 3. Alteração de pacote

- [ ] Campos básicos continuam funcionando.
- [ ] “Adicionar mais informações” inicia recolhido.
- [ ] Sugestões mudam conforme tipo de agência/produto sem apagar dados.
- [ ] Placeholders não são salvos como conteúdo.
- [ ] Campos vazios não aparecem no site.
- [ ] ID e slug permanecem estáveis.
- [ ] Listas são sanitizadas e removem linhas vazias.
- [ ] Título, preço, datas e políticas não recebem dados inventados.
- [ ] Dados estruturados ficam reutilizáveis para carrosséis futuros.

## 4. Pop-up e CTA

- [ ] Um único componente dinâmico serve todos os pacotes.
- [ ] O card abre exatamente o pacote clicado.
- [ ] A página de fundo não rola com o modal aberto.
- [ ] Esc, botão fechar e retorno de foco funcionam.
- [ ] Conteúdo longo rola dentro do modal no celular.
- [ ] CTA seleciona o pacote no formulário principal.
- [ ] O envio segue a integração já existente.
- [ ] Lead aparece somente no CRM da agência correta.
- [ ] Não existe formulário reduzido concorrente dentro do modal.

## 5. Templates e editabilidade

- [ ] Nome, logo, contatos, endereço e pacotes vêm da Fábrica.
- [ ] Cores e fundos usam a paleta sincronizada.
- [ ] Textos, imagens, seções e rodapé têm caminho de edição.
- [ ] Seleção do modelo é persistida após recarregar.
- [ ] Trocar de modelo preserva os dados.
- [ ] Publicar/atualizar usa o mesmo slug da agência.
- [ ] Conteúdo legado incompleto não quebra o layout.
- [ ] Não há textos sobrepostos em nenhuma largura testada.

## 6. Domínios, caminhos e 404

- [ ] Cloudflare é tratado como DNS/proxy/router dos sites das agências.
- [ ] O fluxo público confirmado é Worker wildcard → `public_sites` no Supabase → HTML direto.
- [ ] Não encaminho sites de agência para Lovable, apex ou `SiteViewer` sem uma mudança de arquitetura explicitamente aprovada.
- [ ] Confirmo no painel a rota e o Worker ativos antes de alterá-los.
- [ ] O wildcard DNS está proxied.
- [ ] A Worker Route wildcard cobre `*.canvaviagem.com/*`.
- [ ] Hosts e slugs reservados são validados.
- [ ] `/pacote/<slug>` usa o mesmo subdomínio, sem domínio extra.
- [ ] Atualizar `/pacote/<slug>` devolve o mesmo HTML publicado da agência e abre o estado correto.
- [ ] Assets inexistentes continuam retornando 404 real.
- [ ] Slug de pacote inexistente tem estado de erro útil.
- [ ] O Worker não registra dados pessoais ou corpo do formulário.

## 7. Imagens

- [ ] Imagem do banco é reutilizada por URL, sem novo upload.
- [ ] URL é estável, HTTPS e autorizada.
- [ ] Upload local é validado, redimensionado e convertido para WebP.
- [ ] Metadados desnecessários são removidos.
- [ ] Hash evita duplicação.
- [ ] HTML publicado não carrega base64 quando há URL persistida.
- [ ] `width` e `height` evitam mudança de layout.
- [ ] Imagens abaixo da dobra usam lazy loading.
- [ ] Mobile recebe tamanho adequado.
- [ ] Existe estratégia segura para assets órfãos.

## 8. Testes obrigatórios

- [ ] Build de produção sem erros.
- [ ] Console sem erro novo relevante.
- [ ] Pacote antigo com quatro campos.
- [ ] Pacote novo com todos os detalhes.
- [ ] Pacote com campos opcionais parcialmente preenchidos.
- [ ] Mais de um pacote para detectar troca de dados.
- [ ] Template padrão e todos os templates novos afetados.
- [ ] Celular estreito, tablet e desktop.
- [ ] Teclado, leitor de tela básico e movimento reduzido.
- [ ] Abrir, fechar, voltar e atualizar deep link.
- [ ] Publicar, fechar a Fábrica, reabrir e confirmar persistência.
- [ ] Submeter lead de teste e confirmar CRM/conta correta.

## 9. Publicação e revisão

- [ ] Revisei o diff e excluí mudanças não relacionadas.
- [ ] Não incluí arquivos gerados, credenciais ou artefatos pessoais.
- [ ] Registrei migração e compatibilidade de dados.
- [ ] Uma revisão independente verificou o código.
- [ ] O deploy usa o fluxo atual do projeto, não instruções históricas.
- [ ] Verifiquei a versão pública após o deploy.
- [ ] Atualizei estes documentos se a arquitetura confirmada mudou.

## 10. Sinais para interromper e investigar

Pare antes de publicar se:

- um campo do formulário deixou de chegar ao CRM;
- o site não consegue determinar a agência pelo hostname;
- o modelo volta ao padrão ao recarregar;
- a alteração exige uma chave de serviço no frontend;
- um agente pretende usar Vercel “porque há uma pasta no projeto”;
- alguém confunde a origem do app na Lovable com a entrega pública das agências pelo Worker;
- a Worker Route ou o Worker ativo é alterado sem prévia, testes e rollback;
- a solução cria um arquivo/domínio por pacote sem necessidade;
- imagens são reenviadas em toda publicação;
- uma migração torna campos opcionais obrigatórios;
- o teste só foi feito no desktop.
