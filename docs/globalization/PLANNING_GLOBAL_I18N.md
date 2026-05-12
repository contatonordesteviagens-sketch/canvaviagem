# 🌍 Plano Mestre de Expansão Internacional (Canva Viagem Global)

Este documento detalha a arquitetura técnica e estratégica para migrar o ecossistema Canva Viagem de uma plataforma monoglota (Brasil) para uma solução global SaaS operando em múltiplas moedas, começando pelo **Espanhol (LATAM)** e avançando para o **Inglês (Global)**.

## 🎯 Objetivo de Negócio
Permitir a geração de vendas internacionais escaláveis, suportando fluxos completos em moedas fortes (Dólar, Euro) através de uma experiência de usuário nativa e um motor de IA capaz de redigir e compor anúncios localizados.

---

## 🏗️ Arquitetura Técnica Proposta (i18n Reativo)

Para evitar a manutenção caótica de arquivos duplicados (`IndexES.tsx`, `CalendarES.tsx`), adotaremos a injeção dinâmica baseada em contextos e mapas de idioma.

### Fase 1: Fundação & Core do Sistema (Infraestrutura)
Esta fase prepara os alicerces sem alterar nenhuma funcionalidade atual.

| Ação | Detalhamento Técnico | Status |
| :--- | :--- | :--- |
| **Centralização de Dicionários** | Mover todas as strings estáticas de `/src/pages` para `/src/locales/pt.json` e `/src/locales/es.json`. | ⏳ Aguardando |
| **Implementação do Provider** | Instalar e configurar `react-i18next` ou criar um `useLocaleContext` leve para gerenciar a flag de linguagem no topo da aplicação. | ⏳ Aguardando |
| **Roteamento Inteligente** | Modificar `App.tsx` para aceitar rotas com prefixo `/es/fabrica` ou detector de idioma por URL/Session. | ⏳ Aguardando |

---

## ⚙️ Mapeamento da "Fábrica de Viagens" (O Motor da IA)

A joia da coroa do sistema é a Fábrica. Ela precisará de tradução bidirecional: a interface do dashboard e o próprio conteúdo gerado.

### 1. Fase 1 e 2: Diagnóstico & Ativos
- **Inputs Dinâmicos:** Atualmente, as categorias (Oferta de Pacote, Experiência) estão hardcoded. Precisaremos criar versões em espanhol dos menus de seleção (`src/data/fabrica-categories.ts`).
- **Identidade Visual:** As paletas de cores continuam as mesmas, apenas os rótulos e descrições mudam.

### 2. Fase 3: Motor de Geração de Artes (IA)
Aqui está o ponto mais crítico analisado nos códigos de Supabase:

- **Prompt Engineering Localizado:** As Edge Functions (`fabrica-generate-ad/index.ts`) deverão receber o parâmetro `lang: 'pt' \| 'es'`.
- **Formatação Monetária:** Substituir o `.toLocaleString("pt-BR")` por `.toLocaleString(targetLocale)` dinâmico com base na moeda escolhida (já existe suporte a `ARS` e `USD`, precisará ser vinculado ao idioma).
- **Masking Visual:** Modificar o script de canvas `composeTravelAd` para receber textos de sufixo padrão localizados (Ex: em vez de `"por pessoa"`, injetar automaticamente `"por persona"` no setup espanhol).

### 3. Fase 4: Construtor de Landing Pages
- **HTML Template Localizado:** O arquivo `src/lib/fabrica-html-export.ts` gera o código estático. Criaremos versões localizadas dos textos-padrão do template HTML (cabeçalhos de FAQ, etiquetas de formulário de contato).
- **Auto-Sync Dinâmico:** As sugestões automáticas do Hero do site deverão ser formatadas na linguagem ativa do usuário no momento da edição.

---

## 💸 Gateway de Pagamento & Conversão

Para viabilizar o ganho em dólar/moedas estrangeiras:
1. **Checkout Internacional:** Vincular o `LanguageSwitcher` à troca de links de planos (apontando para Checkout Stripe internacional em vez da Kiwify/Hotmart Brasil quando o modo for ES/EN).
2. **Dashboard do Cliente:** Configurar a leitura da flag de idioma do Supabase para abrir o Stripe Customer Portal na linguagem nativa do pagador.

---

## 📝 Cronograma de Ação Sugerido (Faseado)

### Semana 1: Setup Estrutural (Preparar Terreno)
1. ✅ Criação deste Planejamento (CONCLUÍDO).
2. **Criação do Locale Map Base:** Extrair as primeiras 100 frases críticas da Sales Page e Painel Inicial para objetos JSON.
3. **Adaptação de Tipagem do Supabase:** Adicionar campo `language` no metadata dos Diagnósticos para lembrar o idioma da Fábrica do usuário.

### Semana 2: Tradução da UI & Painéis
1. Ativar o Switcher de Idioma no cabeçalho universal.
2. Criar a Rota `/es/dashboard` consumindo o JSON de traduções (Substituindo o método de criar arquivos `ES.tsx` físicos).
3. Validar gramática com você (revisão humana dos termos técnicos de turismo).

### Semana 3: A Chave da Fábrica (Motor IA)
1. Atualizar as Edge Functions do Supabase para processar `lang`.
2. Fazer os primeiros testes de prompts gerando textos em espanhol nativo perfeitos.
3. Lançamento Beta em ambiente de Teste (Stage).

---

> [!IMPORTANT]
> **Segurança da Implementação:** Nenhuma linha de código em produção será alterada neste momento. Toda a estratégia acima foca em **criação de camadas novas**, garantindo que a operação atual no Brasil permaneça 100% estável e inalterada.

---

*Documento gerado em:* 12 de Maio de 2026.  
*Status:* Pronto para sua revisão crítica e aprovação de andamento.
