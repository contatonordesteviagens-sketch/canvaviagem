# Contexto — Canva Viagem (canvaviagem-repo)

## SEGUNDO CÉREBRO (LER PRIMEIRO)

> Este repositório usa um sistema de segundo cérebro em Obsidian.
> **Antes de qualquer tarefa, leia:** `_BRAIN/CONTEXTO-COMPLETO.md`
> **Para navegar tudo:** `00-ÍNDICE/COMECE_AQUI.md`
> **Para ver conexões:** `00-ÍNDICE/MAPA-CONEXOES.md`
> **Para criar skills:** usar template em `_TEMPLATES/nova-skill.md`

---

## ⚙️ Stack Técnica — LEIA ANTES DE QUALQUER CÓDIGO

| Item | Detalhe |
|------|---------|
| **Plataforma de desenvolvimento** | **Lovable** (lovable.dev) — editor visual no-code/low-code |
| **Framework** | React 18 + TypeScript + Vite |
| **Estilo** | Tailwind CSS + shadcn/ui |
| **Backend** | Supabase (auth + banco de dados + storage) |
| **Deploy** | Vercel (automático via GitHub) |
| **Repositório GitHub** | https://github.com/contatonordesteviagens-sketch/canvaviagem |
| **Site** | https://canvaviagem.com |
| **Rota de planos** | https://canvaviagem.com/planos |

### Regras de desenvolvimento importantes
- **Lovable é o editor principal** — alterações feitas aqui no código local precisam ser commitadas e pushed para o GitHub para refletir no Vercel/produção
- **Não criar arquivos de configuração conflitantes** com o padrão Lovable (vite.config.ts, tailwind.config.ts já estão configurados)
- **Supabase** gerencia auth e dados de assinatura — nunca hardcodar credenciais
- **Build gera prerendering** via react-snap (39 páginas estáticas para SEO) — rodar `npm run build` sempre que editar páginas públicas antes de publicar

---

## O Negócio
**Canva Viagem** — SaaS de assinatura para agentes de viagem. Fornece 250+ reels prontos, templates, ferramentas de copy e IA para que agentes de viagem consigam postar conteúdo profissional sem precisar de designer ou equipe.
- **Modelo:** Assinatura mensal/anual (plataforma web)
- **Avatar:** Agente de viagem que quer crescer no Instagram mas não sabe criar conteúdo
- **Diferencial:** Conteúdo de alta conversão já pronto, baseado em hooks virais reais
- **Fundador:** Lucas Henrique
- **Site:** canvaviagem.com.br

---

## Arquitetura do Projeto

Este repositório (`canvaviagem-repo`) é o **HUB MASTER** de todos os projetos:

```
canvaviagem-repo/
├── .agents/skills/          ← 49 skills de negócio (canvaviagem_*)
├── .claude/skills/          ← 13 skills de vídeo e campanhas (copiadas de agencias-viagem)
├── agencias-viagem/         ← Estratégias de marketing + skills originais de campanha
│   ├── .claude/skills/      ← Skills originais de vídeo + campanha ROI
│   ├── METODOLOGIAS.md      ← Framework completo de copy e hooks (710 linhas)
│   └── remotion-videos/     ← Scripts de análise de vídeo (Gemini AI)
├── canvaviagem-videos/      ← Projeto Remotion (vídeos em React/TSX)
│   └── src/compositions/    ← Video1 a Video5 prontos para renderizar
├── .obsidian/               ← Vault Obsidian ativo (REST API porta 27124)
├── CENTRAL_HUB.md           ← Dashboard visual de TODAS as skills (abrir no Obsidian)
└── lp-cv.md.md              ← Design system da página /planos
```

---

## Skills Disponíveis (62 total)

### Grupo A — Negócio (.agents/skills/ | 49 skills)
Comando: `/canvaviagem_[nome]`
- **Orquestrador:** `canvaviagem_orquestrador` — ponto de entrada diário
- **Liderança:** `canvaviagem_ceo`, `canvaviagem_cmo`, `canvaviagem_ganancia`
- **Dados:** `canvaviagem_dados_stripe`, `canvaviagem_dados_analytics`, `canvaviagem_relatorio_visual`, `canvaviagem_gestao_tokens`
- **Churn:** `canvaviagem_churn_diretor`, `canvaviagem_churn_onboarding`, `canvaviagem_churn_engajamento`, `canvaviagem_churn_winback`
- **Aquisição:** `canvaviagem_aquisicao_diretor`, `canvaviagem_aquisicao_conteudo`, `canvaviagem_aquisicao_email`, `canvaviagem_aquisicao_trafego`
- **Escala:** `canvaviagem_escala_diretor`, `canvaviagem_escala_funil`, `canvaviagem_escala_anual`
- **Produto:** `canvaviagem_produto_diretor`, `canvaviagem_produto_youtube`, `canvaviagem_produto_social`, `canvaviagem_produto_feedback`, `canvaviagem_produto_inovacao`
- **Relacionamento:** `canvaviagem_atendimento`, `canvaviagem_comunidade`, `canvaviagem_hotmart`, `canvaviagem_lancamento`, `canvaviagem_collab`
- **Conteúdo:** `canvaviagem_copywriter`, `canvaviagem_designer`, `canvaviagem_feed`, `canvaviagem_stories`, `canvaviagem_seo`, `canvaviagem_blog`, `canvaviagem_revisor`, `canvaviagem_mercado`, `canvaviagem_trafego`
- **Mapa completo:** ver `.agents/MAPA.md`

### Grupo B — Vídeo & Campanhas (.claude/skills/ | 13 skills)
- **Pipeline de vídeo:** `/video-pipeline-completo`, `/video-pesquisa-mercado`, `/video-gerar-composicao`, `/video-renderizar`
- **Campanhas ROI:** `/departamento-campanhas-roi`, `/agente-1-creative-assets` → `/agente-6-performance-predictor`
- **Tráfego:** `/traffic-campaign-analyzer`, `/scaling-recommendation`

---

## Context Navigation (Graphify — Economia de Tokens)

> **Regra principal:** Antes de ler qualquer arquivo bruto, consulte o knowledge graph.
> Isso reduz o consumo de tokens em até 71x por sessão.

1. **SEMPRE** consulte `graphify-out/wiki/index.md` como ponto de entrada do codebase
2. **SEMPRE** use `graphify-out/GRAPH_REPORT.md` para entender estrutura e conexões
3. Só leia arquivos brutos se eu pedir explicitamente ou se o grafo não tiver a informação
4. Após mudanças significativas no código, reconstrua o grafo: `graphify . --update --obsidian`

**Executável:** `C:/Users/win 10/AppData/Local/Python/pythoncore-3.14-64/Scripts/graphify.exe`
**Vault Obsidian do grafo:** `graphify-out/obsidian/`
**Consultar grafo:** `graphify query "sua pergunta"`

---

## Regras Críticas

1. **IDs Remotion usam HÍFENS, nunca underscores**
   - ✅ `Video1-SegredoDasGrandes` | ❌ `Video1_SegredoDasGrandes`
2. **Render Remotion** sempre incluir `.mp4`: `npx remotion render <ID> out/nome.mp4`
3. **Iniciar o dia** sempre com `/canvaviagem_orquestrador`
4. **Antes de publicar** sempre passar pelo `/canvaviagem_revisor`
5. **Skills de vídeo** requerem: Node.js + Remotion em `canvaviagem-videos/`, e `GOOGLE_API_KEY` no `.env` para legendas IA

---

## Vídeos Remotion Prontos

| ID (com hífen) | Arquivo | Duração | Tema |
|----------------|---------|---------|------|
| `Video1-SegredoDasGrandes` | Video1_SegredoDasGrandes.tsx | 30s | Segredo das grandes agências |
| `Video2-EnquantoVoceTrava` | Video2_EnquantoVoceTrava.tsx | 30s | Enquanto você trava no Canva |
| `Video3-MensagemWhatsApp` | Video3_MensagemWhatsApp.tsx | 25s | Mensagem WhatsApp inesperada |
| `Video4-AchoFofo` | Video4_AchoFofo.tsx | 28s | Ironizando Canva amador |
| `Video5-SemEquipe` | Video5_SemEquipe.tsx | 25s | Como postar 5 vídeos sem equipe |

```bash
cd "C:\Users\win 10\Desktop\canvaviagem-videos"
npx remotion render Video1-SegredoDasGrandes out/v1.mp4
```

---

## Dashboard Visual

Para ver tudo de forma visual, abra o arquivo **CENTRAL_HUB.md** no Obsidian.
Este arquivo mostra todas as 62 skills organizadas por categoria, com pipelines prontos e links para referência.

---

## Contexto de Negócio Profundo

Ver `_BRAIN/CONTEXTO-COMPLETO.md` para:
- ICP detalhado (quem compra, dores, gatilhos)
- Regras de Meta Ads e segurança de API
- Estado atual do projeto (Março 2026)
- Todas as conexões entre skills

## Arquivos Soltos (organização)

| Arquivo Raiz | Conteúdo |
|---|---|
| `CENTRAL_HUB.md` | Dashboard 62 skills |
| `DEPARTAMENTOS.md` | Organograma 85+ skills |
| `GUIA_CLICKUP.md` | Gestão de tarefas |
| `GOOGLE_ADS_PLANO_COMPLETO.md` | Plano Google Ads |
| `lp-cv.md.md` | Design system /planos |
| `_BRAIN/CONTEXTO-COMPLETO.md` | Contexto IA completo |
| `00-ÍNDICE/COMECE_AQUI.md` | Hub Obsidian |
| `00-ÍNDICE/MAPA-CONEXOES.md` | Mapa de conexões |

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current
