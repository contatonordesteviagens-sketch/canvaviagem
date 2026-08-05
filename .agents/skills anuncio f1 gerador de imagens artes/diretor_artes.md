# 🏢 DIRETÓRIO DE SKILLS — DIRETOR DE ARTES & SISTEMAS
## Departamento de Inteligência e Composição · Canva Viagem
### Função: Mapeamento cirúrgico de fluxo de dados e lógica de renderização

Este documento registra as **Skills de Direção de Artes** formais para o sistema Fábrica, dividindo a inteligência da plataforma em departamentos isolados. Toda e qualquer modificação estética, estrutural ou lógica nas fases da Fábrica deve consultar o respectivo Departamento antes de ser executada.

---

## 🔵 DEPARTAMENTO 1: DIAGNÓSTICO E CAPTURA DE DADOS (F1)
**Arquivo Core:** `src/pages/fabrica/Phase1Diagnostico.tsx`  
**Função:** Absorver o perfil da agência e calcular o nível de maturidade digital.

### 🧠 Lógica de Inteligência:
- **Tipo:** Determinística Pura (Zero LLM).
- **Motor:** `calculateScore()` em `src/lib/fabrica-scoring.ts`.
- **Fluxo:** Quiz com pesos fixos (Presença 25%, Conteúdo 25%, Vendas 20%, Tráfego 15%, Conversão 15%).
- **Outputs Gerados:** `digitalScore`, `level`, `gargalos[]`.

### 🔧 Regras de Direção (Skills de Ajuste):
1. **Validação Visual:** O botão finalize é bloqueado via boolean flat (`!state.agencyName || !state.niche...`). Para forçar novas validações, insira no array de bloqueio.
2. **Persistência Local:** O state é injetado diretamente no Context via `update({ ... })` que salva imediatamente no `localStorage` (`fabrica-context-v*`).

---

## 🔴 DEPARTAMENTO 2: ESTRATÉGIA E GESTÃO DE ATIVOS (F2)
**Arquivo Core:** `src/pages/fabrica/Phase2Ativos.tsx`  
**Função:** Organizar pacotes de ofertas, sugerir conteúdos do CMS e planejar o cronograma de 30 dias.

### 🧠 Lógica de Inteligência:
- **Tipo:** Curadoria Estática + Consultas SQL (Supabase CMS).
- **Filtragem:** A heurística `matchesDestinos()` normaliza os destinos inseridos na Fase 1 e busca correspondências exatas no título ou destino dos vídeos/legendas.
- **Planos:** 100% Hardcoded (`CHECKLIST_30`).

### 🔧 Regras de Direção (Skills de Ajuste):
1. **Regra da Ponte F2→F4 (Site):** Edições em pacotes nesta fase devem obrigatoriamente disparar `update({ selectedPackages: novosPacotes })` para que a Fase 4 herde automaticamente o conteúdo atualizado.
2. **Ajuste de Conteúdo:** O mapeamento de nicho (`getOfertasByNiche`) reside em `src/data/fabrica-ofertas.ts`. Se o nicho muda, as ofertas base são recarregadas.

---

## 🎨 DEPARTAMENTO 3: GERAÇÃO E DIREÇÃO DE ARTES (F3)
**Arquivo Core:** `src/pages/fabrica/Phase3ArtFactory.tsx` & `src/lib/fabrica-compose-art.ts`  
**Função:** Transformar dados brutos (preço, destino, logo) em composições visuais de alto impacto.

### 🧠 Lógica de Inteligência:
- **Tipo:** Híbrida (IA Generativa para prompts + Motor Canvas Estritamente Tipado).
- **Geração de Imagem (AI):** Dispara Edge Function `fabrica-generate-ad` usando modelo Gemini.
- **Composição Visual:** HTML5 Canvas puro via `composeTravelAd()`.

### 🔧 Regras de Direção (Skills de Ajuste):
1. **Hierarquia Visual:** Títulos ocupam o topo, seguidos por highlights. Preços são desenhados dinamicamente na parte inferior acima da margem de segurança.
2. **Margens de Proteção (Safe Zones):**
   - **Stories:** 480px na base (área de UI do Instagram).
   - **Logo:** Topo esquerdo, SEMPRE com fundo de proteção branco para manter contraste.
3. **Blindagem de Cores:** A função `ensureContrast()` ajusta a cor da fonte se o contraste com a cor primária da marca for menor que 0.35.
4. **Variantes (V0 a V4):** Diferentes layouts de distribuição de caixas de preço e textos. O ajuste de qualquer layout exige a modificação do `case "VX"` correspondente em `composeTravelAd`.

---

## 🌐 DEPARTAMENTO 4: ARQUITETURA E GERAÇÃO DE SITES (F4)
**Arquivo Core:** `src/pages/fabrica/Phase4LandingBuilder.tsx` & `src/lib/fabrica-html-export.ts`  
**Função:** Empacotar os dados coletados em uma Single Page Application autônoma e exportável.

### 🧠 Lógica de Inteligência:
- **Tipo:** Templating Declarativo (Semântico).
- **Sync:** Auto-sync disparado pelo `useEffect` ao montar a tela, consumindo `selectedPackages` e `siteContent`.

### 🔧 Regras de Direção (Skills de Ajuste):
1. **Sincronização Automática:** Se `hasDefaultPackages` for falso e houver dados de arte anterior, o gerador automaticamente monta o Hero e o primeiro bloco de ofertas.
2. **Exportação Cirúrgica:** O gerador de HTML estático deve consolidar as cores em variáveis CSS na tag `<style>` baseadas em `state.primaryColor` da Fase 1.

---

## 📈 DEPARTAMENTO 5: PERFORMANCE E DASHBOARD (F5)
**Arquivo Core:** `src/pages/fabrica/Phase5Dashboard.tsx`  
**Função:** Exibir métricas de tráfego, conversão e insights de evolução da agência.

### 🧠 Lógica de Inteligência:
- **Tipo:** Analytics em Tempo Real + Scripts Condicionais.
- **Insight da IA:** Ternário baseado no volume de cliques (`stats.clicks > 0`).
- **Conteúdo Semanal:** Hardcoded dinâmico (Troca conforme o dia da semana `new Date().getDay()`).

### 🔧 Regras de Direção (Skills de Ajuste):
1. **Encoding Guard:** Nunca salvar arquivos com Mojibake. Sempre forçar UTF-8 no salvamento de strings literais em JSX.
2. **Real Metrics:** Puxar visualizações do contador do Supabase disparado no acesso da landing page pública do agente.

---

## 🎯 MODO DIRETOR DE ARTES (COMO AGIR)
Quando solicitado a fazer uma intervenção cirúrgica em qualquer dessas áreas:
1. Identifique o Departamento.
2. Carregue as Regras de Direção daquele Departamento.
3. Verifique o impacto no `FabricaState` (se altera o contrato entre as fases).
4. Aplique a correção preservando as margens de blindagem (Safe Zones) e as regras de contraste.

*Assinado,*  
**Antigravity — Diretor de Engenharia & Artes**
