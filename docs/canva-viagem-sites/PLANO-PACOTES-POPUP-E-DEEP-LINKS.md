# Plano: detalhes de pacote, pop-up e deep links

## Status em 16 de julho de 2026

- Implementado no código: campos opcionais recolhidos, recomendações por segmento, modal dinâmico único, seções vazias ocultas, galeria por URL, CTA para o formulário principal, slug, abertura por deep link, comunicação segura com o `SiteViewer` nos fluxos internos, compressão WebP e deduplicação dos uploads locais.
- Validado localmente: persistência após recarregar, modal com conteúdo completo, CTA selecionando o pacote no formulário existente e layout mobile.
- Confirmado em produção: a Worker Route wildcard existente já entrega diretamente o HTML de `public_sites` e responde na raiz e em `/pacote/<slug>`. O Worker endurecido em `cloudflare/agency-router` é apenas um candidato de substituição; não deve trocar o Worker ativo sem prévia isolada, testes e rollback.
- Stand-by: carrosséis gerados a partir desses mesmos campos e páginas reais indexáveis por pacote. Nenhuma dessas duas evoluções deve duplicar o cadastro.

## 1. Objetivo

Oferecer a sensação de uma página completa para cada pacote sem gerar um site, domínio ou arquivo HTML independente para cada oferta.

O visitante vê cards curtos na página inicial. Ao tocar em um card, um único componente de pop-up recebe o pacote selecionado e renderiza seus detalhes. O CTA entrega a seleção ao formulário principal já integrado ao CRM.

## 2. Por que um único pop-up dinâmico

Não é necessário construir um pop-up diferente para cada pacote. O componente é único; os dados variam.

```text
lista de pacotes → pacote selecionado → modal genérico → campos disponíveis
```

Benefícios:

- menos HTML duplicado;
- manutenção em um único lugar;
- compatibilidade simples entre templates;
- carregamento sob demanda;
- experiência uniforme;
- os mesmos dados podem alimentar carrosséis, anúncios e futuras páginas reais.

## 3. O que aparece no card e no pop-up

### Card resumido

Manter compacto:

- imagem principal;
- título;
- destino ou categoria curta;
- preço “a partir de”, quando aplicável;
- duração ou data principal, quando relevante;
- ação “Ver detalhes”.

### Pop-up completo

Renderizar apenas o que foi preenchido:

- galeria ou imagem principal;
- título, categoria e destino;
- descrição longa;
- preço e condições de pagamento;
- datas, duração e saída;
- destaques;
- o que inclui e não inclui;
- roteiro;
- hospedagem, transporte e alimentação;
- regras, documentos e observações;
- perguntas frequentes do pacote;
- identificação e contato resumido da agência;
- CTA “Reservar este pacote”.

Contato institucional completo permanece na página inicial. No pop-up, mostrar apenas o necessário para confiança e ação, sem repetir uma seção inteira da home.

## 4. Comportamento do CTA

Ao tocar em “Reservar este pacote”:

1. guardar o ID estável do pacote selecionado;
2. fechar o pop-up;
3. localizar o formulário principal;
4. selecionar/preencher o campo de interesse com o pacote;
5. rolar e mover o foco para o primeiro campo apropriado;
6. deixar o envio seguir exatamente a integração existente.

Se o formulário não for encontrado, exibir uma mensagem controlada e registrar um erro técnico sem dados pessoais. Não abrir um formulário alternativo silenciosamente.

## 5. Deep link sem criar outro domínio

O endereço sugerido é:

```text
https://agencia.canvaviagem.com/pacote/slug-estavel-do-pacote
```

Isso continua sendo o mesmo site e o mesmo subdomínio. O caminho permite:

- compartilhar diretamente um pacote;
- abrir o site já com o pop-up correspondente;
- usar o botão voltar do navegador;
- medir acesso por pacote;
- evoluir futuramente para uma página própria sem mudar o link público.

### Estado esperado

- Abrir um card: atualizar o histórico para `/pacote/<slug>` sem recarregar o app.
- Fechar o pop-up: retornar ao caminho anterior.
- Acessar o deep link diretamente: carregar o site da agência e abrir o pacote quando os dados estiverem prontos.
- Slug inexistente: carregar o site e mostrar “Pacote não encontrado”, com retorno à lista; não exibir uma página vazia.

O slug precisa ser persistido. Alterar o título não deve quebrar links já compartilhados.

## 6. Entrega pública e visualização interna

### Produção nos subdomínios das agências

O fluxo normal não usa `iframe`, `SiteViewer` ou Lovable:

```text
agencia.canvaviagem.com/pacote/<slug>
      ↓
Cloudflare wildcard Worker
      ↓
mesma linha da agência em public_sites
      ↓
HTML lê o pathname e abre o pacote pelo slug
```

O Worker seleciona o site pelo hostname e devolve o mesmo HTML em qualquer caminho válido da agência. `/pacote/<slug>` não cria outra publicação e não precisa de fallback da aplicação principal.

### Prévia/fallback dentro da aplicação

Quando o site publicado é apresentado em um `iframe`/`srcDoc`, a URL do conteúdo interno não controla automaticamente a barra do navegador. A comunicação deve ser explícita:

```text
card no site publicado
      ↓ postMessage validado
SiteViewer atualiza history.pushState
      ↓
/pacote/<slug>
```

Na abertura direta, o fluxo é inverso:

```text
App lê pathname
      ↓
SiteViewer carrega public_sites
      ↓ postMessage para o iframe
HTML abre o pacote pelo slug
```

Validar sempre `event.source`, formato, tipo da mensagem e slug. Não aceitar comandos arbitrários de outros frames.

Esse fluxo com `SiteViewer` existe para visualização/fallback da aplicação. Ele não descreve a entrega normal de `slug.canvaviagem.com` em produção.

## 7. Modelo de dados incremental

Manter os campos existentes e acrescentar opcionais. Estrutura conceitual:

```text
Pacote
├── id e slug estáveis
├── resumo: título, descrição curta, preço e imagem
├── classificação: tipo e destino
├── detalhes: descrição longa, duração, datas e saída
├── listas: destaques, inclui, não inclui e observações
├── roteiro estruturado
├── logística: transporte, hospedagem e alimentação
├── políticas e documentação
├── galeria
└── FAQ do pacote
```

O painel deve mostrar os campos básicos primeiro. A ação **Adicionar mais informações** expande os campos detalhados. Nada detalhado deve ser obrigatório para salvar um pacote já existente.

## 8. Reutilização futura

Os dados devem ser estruturados, não presos ao texto visual do pop-up. Assim, a mesma entidade poderá gerar:

- card do site;
- pop-up completo;
- deep link;
- carrossel de Instagram;
- anúncio estático;
- roteiro de vídeo;
- mensagem de WhatsApp;
- proposta ou PDF;
- página completa em uma fase posterior.

Exemplo de carrossel futuro:

1. capa com imagem e título;
2. o que inclui;
3. roteiro/destaques;
4. preço e condições;
5. CTA e contato.

## 9. Etapas de entrega

### Etapa A — compatível

- adicionar campos opcionais;
- manter editor compacto por padrão;
- renderizar detalhes no pop-up;
- preservar CTA → formulário → CRM;
- testar pacotes antigos.

### Etapa B — deep links

- slugs persistidos;
- sincronização do histórico;
- abertura direta do pacote;
- tratamento de 404 lógico;
- validação de que o Worker existente continua devolvendo o mesmo HTML nos deep links.

### Etapa C — mídia e reutilização

- galeria leve;
- compressão/deduplicação de uploads;
- contrato de conteúdo para carrosséis;
- métricas de abertura e conversão sem dados pessoais.

### Etapa D — páginas reais, se houver necessidade

Só criar uma página renderizada/SEO por pacote quando houver justificativa de busca orgânica, indexação e conteúdo suficiente. O endereço pode ser mantido, trocando apenas a forma de renderização.

## 10. Critérios de aceite

- um único modal serve a todos os pacotes;
- o card correto nunca abre dados de outro pacote;
- conteúdo longo não estoura a tela no celular;
- todos os campos opcionais somem com elegância quando vazios;
- CTA mantém a integração atual;
- o botão voltar reabre/fecha o estado esperado;
- a URL direta funciona depois de atualizar a página;
- nenhum caminho cria cadastro de domínio adicional;
- não há HTML, imagem ou formulário duplicado por pacote sem necessidade.
