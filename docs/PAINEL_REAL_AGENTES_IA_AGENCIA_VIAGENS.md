# Painel real de agentes de IA para apresentar a uma agencia de viagens

Este material e para usar na reuniao, com a tela aberta no Codex/Claude Code.
O objetivo nao e mostrar "uma apresentacao bonita". O objetivo e mostrar que existe uma maquina real de agentes pronta para operar marketing, remarketing, conteudo, videos, artes, SEO, WhatsApp, planilhas e gestao.

## O que existe instalado/encontrado nesta maquina

### 1. Skills do Canva Viagem/Codex

Local principal:

`C:\Users\win 10\Desktop\canvaviagem-repo\.agents\skills\`

Essas sao as skills mais valiosas para vender ao cliente:

| Departamento | Agentes reais | O que mostrar na reuniao |
|---|---|---|
| Diretoria de IA | Canvaviagem Orquestrador, Canvaviagem CEO, Canvaviagem Diretor de Marketing, Canvaviagem Ganancia CRO | Diagnostico do dia, prioridade, plano de acao e ordem dos agentes |
| Marketing organico | Departamento de Marketing Social, Canvaviagem Aquisicao Conteudo, Canvaviagem Copywriter, Canvaviagem Revisor | Calendario de posts, Reels, stories, carrosseis, legendas e CTAs |
| Artes e criativos | Canvaviagem Designer, Canvaviagem Feed Creator, Canvaviagem Stories Creator, Departamento de Design | Briefings de imagem, prompts, feed 4:5, stories 9:16 e padrao visual |
| Videos e Reels | Departamento de Videos & Reels, video-pipeline-completo, video-pesquisa-mercado, video-gerar-composicao, video-renderizar | Roteiro de Reel, composicao Remotion, renderizacao de MP4 quando houver projeto Remotion configurado |
| SEO e blog | Canvaviagem SEO Manager, Departamento de SEO & Autoridade, Canvaviagem Blog Manager, Blog Automacao Autonoma, Analista de Blog | Pauta de blog, palavras-chave, artigo, reaproveitamento para redes |
| Inteligencia de mercado | Departamento de Inteligencia, Canvaviagem Pesquisa de Mercado, Escuta de Redes Sociais, Pesquisa YouTube | Pesquisa de concorrentes, tendencias, hooks, ideias e oportunidades |
| Remarketing e relacionamento | Canvaviagem Diretor de Email Marketing, Aquisicao Email, Atendimento, Comunidade, Win-Back, Engajamento | Sequencias de WhatsApp, emails, reativacao de leads e clientes antigos |
| Midia paga e remarketing pago | Departamento de Midia Paga, Canvaviagem Meta Ads Manager, Gestor de Trafego Pago, Meta Ads Compliance | Estrutura de campanha, criativos, publico de remarketing, auditoria |
| Vendas e funil | Canvaviagem Estrategista de Vendas, Escala Funil, Escala Plano Anual, Lancamento, Hotmart | Oferta, funil, proposta, recuperacao de carrinho e upsell |
| Dados e gestao | Dados Analytics, Dados Stripe, Relatorio Visual, Spreadsheets | Relatorio semanal, planilha de vendas, entradas/saidas, pipeline |

### 2. Biblioteca `.agency-agents`

Local:

`C:\Users\win 10\Desktop\CANVA_VIAGEM_ESTAVEL_24_ABRIL\.agency-agents\`

Essa biblioteca tem agentes gerais por area. Os mais vendaveis para esse cliente:

| Departamento | Agentes reais | Como vender |
|---|---|---|
| Social media | marketing-social-media-strategist, marketing-instagram-curator, marketing-content-creator, marketing-carousel-growth-engine, marketing-tiktok-strategist, marketing-short-video-editing-coach | Equipe de redes sociais para planejar, criar e otimizar conteudo |
| SEO | marketing-seo-specialist, marketing-ai-citation-strategist | Ranqueamento no Google e presenca em respostas de IA |
| Growth | marketing-growth-hacker, product-trend-researcher | Experimentos para captar leads e descobrir formatos que funcionam |
| Paid media | paid-media-paid-social-strategist, paid-media-creative-strategist, paid-media-tracking-specialist, paid-media-auditor | Remarketing, criativos, tracking e auditoria de campanhas |
| Vendas | sales-outbound-strategist, sales-discovery-coach, sales-pipeline-analyst, sales-proposal-strategist | Follow-up, proposta, qualificacao e pipeline comercial |
| Operacao | support-finance-tracker, support-analytics-reporter, specialized-report-distribution-agent, specialized-data-consolidation-agent | Planilhas, relatorios, consolidacao de dados e rotina operacional |
| Design | design-brand-guardian, design-image-prompt-engineer, design-visual-storyteller, design-ui-designer | Direcao criativa, prompts de imagem, identidade e landing pages |
| Automacao | specialized-workflow-architect, automation-governance-architect, agents-orchestrator | Desenho dos fluxos automatizados e governanca dos agentes |

### 3. Sistema Fabrica dentro deste projeto

Local:

`C:\Users\win 10\Desktop\CANVA_VIAGEM_ESTAVEL_24_ABRIL\src\pages\fabrica\`

Fases encontradas:

| Fase | Arquivo | O que demonstrar |
|---|---|---|
| F1 Diagnostico | Phase1Diagnostico.tsx | Diagnostico da agencia, nicho, maturidade digital |
| F2 Ativos | Phase2Ativos.tsx | Pacotes, ofertas, ativos e cronograma |
| F3 Art Factory | Phase3ArtFactory.tsx | Geracao/composicao de artes para viagem |
| F4 Landing Builder | Phase4LandingBuilder.tsx | Criacao de landing page/site da agencia |
| F5 Dashboard | Phase5Dashboard.tsx | Metricas, cliques, insights e gestao |

Esse e o melhor ponto para impressionar se estiver funcionando localmente, porque e visual: arte, site, dashboard e fluxo completo.

## Como ativar na pratica

### No Codex

Fale explicitamente o nome da skill/agente:

```text
Use a skill Canvaviagem Orquestrador e monte o briefing do dia para uma agencia de viagens.
```

```text
Use Departamento de Marketing Social — Canva Viagem para criar uma semana de posts.
```

```text
Use Canvaviagem Diretor de Email Marketing e Canvaviagem Atendimento para criar uma sequencia de remarketing por WhatsApp e email.
```

### No Claude Code

Pelo README encontrado em `.agency-agents\integrations\claude-code\README.md`, a ativacao e por nome:

```text
Activate marketing-social-media-strategist and create a 30-day Instagram plan for a travel agency.
```

```text
Activate paid-media-paid-social-strategist and build a Meta Ads remarketing campaign for people who engaged with Instagram and WhatsApp.
```

```text
Activate sales-pipeline-analyst and design a spreadsheet pipeline for travel package leads.
```

### No OpenClaw

Pelo README encontrado em `.agency-agents\integrations\openclaw\README.md`, o fluxo e:

```bash
./scripts/convert.sh --tool openclaw
./scripts/install.sh --tool openclaw
openclaw gateway restart
```

Depois os agentes ficam disponiveis por `agentId` nas sessoes do OpenClaw.

### Na Fabrica/Canva Viagem

Rodar o app local:

```bash
npm run dev
```

Depois abrir o sistema e demonstrar as fases da Fabrica:

- Diagnostico da agencia
- Organizacao dos pacotes
- Geracao de arte
- Landing page
- Dashboard

## Roteiro de reuniao que realmente vende

### Abertura

Fala:

"Eu nao vou te mostrar uma ferramenta solta. Eu vou te mostrar uma equipe de IA separada por departamento, instalada na minha maquina, que consegue operar a parte organica e comercial da sua agencia: conteudo, artes, videos, WhatsApp, email, SEO, planilha e remarketing."

### Departamento 1: Diretoria de IA

Agentes para citar:

- Canvaviagem Orquestrador
- Canvaviagem CEO
- Canvaviagem Diretor de Marketing
- Canvaviagem Ganancia CRO

Demo:

```text
Use Canvaviagem Orquestrador. Crie o briefing do dia para uma agencia de viagens que quer vender pacotes de julho, captar leads no WhatsApp e reativar contatos antigos. Traga: diagnostico, prioridade, agentes acionados, acao de hoje e indicador que vamos acompanhar.
```

O que dizer:

"Aqui a IA age como gerente. Ela decide o que fazer antes de criar qualquer conteudo."

### Departamento 2: Marketing organico e postagens automaticas

Agentes para citar:

- Departamento de Marketing Social
- Canvaviagem Aquisicao Conteudo
- marketing-social-media-strategist
- marketing-instagram-curator
- marketing-carousel-growth-engine
- marketing-content-creator

Demo:

```text
Use Departamento de Marketing Social — Canva Viagem. Crie um calendario de 7 dias para uma agencia de viagens. Quero 2 Reels, 2 carrosseis, 2 posts de prova social, 1 post de oferta, stories diarios, CTA para WhatsApp e objetivo comercial de cada publicacao.
```

O que mostrar:

- Calendario da semana
- Formato de cada post
- Gancho
- Legenda
- CTA
- Oferta
- O que postar nos stories

Fala:

"Isso vira o calendario de postagens automaticas. A equipe aprova, ajusta a oferta e agenda."

### Departamento 3: Fotos, artes e criativos

Agentes para citar:

- Canvaviagem Designer
- Canvaviagem Feed Creator
- Canvaviagem Stories Creator
- Departamento de Design
- design-image-prompt-engineer
- design-brand-guardian
- Diretor de Artes local

Demo:

```text
Use Canvaviagem Feed Creator e Canvaviagem Stories Creator. Crie 3 briefings de artes para vender pacote para Maceio: uma arte feed 4:5, um story 9:16 e uma capa de Reel. Inclua texto principal, subtitulo, CTA, direcao visual, foto sugerida e prompt de imagem.
```

O que dizer:

"Aqui a IA nao so escreve. Ela direciona a arte: texto, layout, imagem, formato e CTA."

Se quiser gerar imagem com IA ao vivo:

```text
Crie uma imagem realista vertical 9:16 para story de agencia de viagens vendendo pacote para Maceio, com praia clara, casal brasileiro sorrindo, clima premium, espaco limpo para texto no topo e rodape para WhatsApp.
```

### Departamento 4: Videos e Reels

Agentes para citar:

- Departamento de Videos & Reels
- video-pipeline-completo
- video-pesquisa-mercado
- video-gerar-composicao
- video-renderizar
- marketing-short-video-editing-coach
- marketing-tiktok-strategist

Demo:

```text
Use Departamento de Videos & Reels e video-pipeline-completo. Crie um roteiro de Reel de 30 segundos para agencia de viagens vender pacote para Porto de Galinhas. Quero hook de 2 segundos, cenas, texto na tela, narração, trilha sugerida, CTA e variação para TikTok.
```

O que dizer:

"Esse departamento transforma campanha em video: pesquisa, roteiro, cenas, edicao e, quando conectado ao Remotion, renderizacao."

Observacao honesta para a reuniao:

No workspace atual encontrei a pasta `canvaviagem-videos`, mas ela esta sem projeto Remotion completo visivel aqui. Entao a demo segura e criar roteiro/composicao/briefing. Para renderizar MP4 ao vivo, precisa estar com o projeto Remotion instalado e a composicao disponivel.

### Departamento 5: Remarketing, WhatsApp e email

Agentes para citar:

- Canvaviagem Diretor de Email Marketing
- Canvaviagem Aquisicao Email
- Canvaviagem Atendimento
- Canvaviagem Anti-Churn Win-Back
- Canvaviagem Comunidade
- marketing-private-domain-operator
- sales-outbound-strategist
- sales-discovery-coach

Demo:

```text
Use Canvaviagem Diretor de Email Marketing, Canvaviagem Atendimento e Canvaviagem Anti-Churn Win-Back. Crie uma campanha de remarketing para leads que pediram orcamento de viagem no WhatsApp e nao fecharam. Quero 5 mensagens de WhatsApp, 3 emails, segmentacao da lista, gatilho de envio e CTA final.
```

O que dizer:

"O dinheiro mais rapido esta na base atual. Quem ja chamou no WhatsApp, quem ja pediu orcamento, quem ja clicou, quem sumiu. A IA organiza o reaparecimento."

### Departamento 6: SEO e autoridade

Agentes para citar:

- Canvaviagem SEO Manager
- Departamento de SEO & Autoridade
- Canvaviagem Blog Manager
- Canvaviagem Blog Automacao Autonoma
- marketing-seo-specialist
- marketing-ai-citation-strategist

Demo:

```text
Use Canvaviagem SEO Manager e Canvaviagem Blog Manager. Crie uma estrategia de SEO para uma agencia de viagens aparecer no Google para pacotes para Maceio, Porto de Galinhas e Gramado. Quero palavras-chave, 5 artigos, 3 paginas de destino e como reaproveitar isso em Instagram e WhatsApp.
```

O que dizer:

"Rede social gera demanda agora. SEO cria ativo para a agencia ser encontrada quando o cliente ja esta pesquisando."

### Departamento 7: Planilhas, vendas e gestao

Agentes para citar:

- Spreadsheets
- sales-pipeline-analyst
- support-finance-tracker
- specialized-data-consolidation-agent
- Canvaviagem Relatorio Visual
- Canvaviagem Dados Analytics

Demo:

```text
Use Spreadsheets e sales-pipeline-analyst. Monte uma estrutura de planilha para agencia de viagens controlar leads, origem, destino desejado, valor do pacote, etapa do funil, proximo follow-up, status de pagamento, entrada, saida e lucro estimado.
```

O que dizer:

"A IA tambem organiza a retaguarda. Nao adianta gerar lead se a agencia perde follow-up, nao sabe margem e nao sabe quais canais vendem."

## Demonstração pratica em 20 minutos

### Minuto 0-2: abrir com autoridade

"Vou te mostrar uma equipe de IA separada por departamento."

### Minuto 2-5: Orquestrador

Rodar o briefing do dia.

### Minuto 5-9: calendario organico

Rodar o calendario de 7 dias.

### Minuto 9-12: arte/foto

Gerar briefing de feed + story + prompt de imagem.

### Minuto 12-15: Reel/video

Gerar roteiro de video com cenas e CTA.

### Minuto 15-18: remarketing WhatsApp/email

Gerar sequencia para leads antigos.

### Minuto 18-20: fechar plano de implantacao

"Em 30 dias a gente deixa isso rodando: conteudo, WhatsApp, email, planilha e rotina semanal."

## Proposta de implantacao para vender

### Setup inicial

- Mapear a agencia, ofertas, destinos, diferenciais e base de contatos.
- Configurar os departamentos de IA.
- Criar biblioteca de prompts e padroes da marca.
- Criar calendario organico inicial.
- Criar sequencias de remarketing.
- Criar planilha de funil e gestao.

### Gestao mensal

- Conteudo semanal.
- Roteiros de Reels.
- Artes e briefings.
- Sequencias WhatsApp/email.
- Analise de concorrentes.
- Relatorio de performance.
- Ajustes de funil.

### Piloto de 30 dias

Entregas:

- 1 diagnostico da agencia
- 1 calendario de 30 dias
- 12 posts prontos ou briefados
- 8 roteiros de Reels
- 1 sequencia de WhatsApp
- 1 sequencia de email
- 1 planilha de controle comercial
- 1 relatorio final com proximas acoes

## Frase final para fechar

"A gente nao esta vendendo IA. A gente esta colocando uma equipe operacional dentro da sua agencia para trazer cliente, reaparecer para quem ja demonstrou interesse e organizar a venda."

