# 🧠 Playbook: Protocolo de Tradução Global (Skill de IA)

**Objetivo:** Servir como um roteiro de execução imediata para o assistente de IA quando o usuário autorizar a migração internacional.

---

## 🛠️ Etapa 1: A Fundação Técnica (React + i18next)

1. **Instalação das Dependências:**
   Executar no terminal do projeto: `npm install i18next react-i18next i18next-browser-languagedetector`

2. **Criação do Core i18n:**
   Criar arquivo `src/i18n/config.ts` carregando os pacotes de recursos JSON (`src/locales/pt.json` e `src/locales/es.json`).

3. **Substituição de Componentes Simples:**
   Em vez de criar `PageES.tsx`, altere o `Page.tsx` importando o hook `useTranslation`:
   ```typescript
   const { t } = useTranslation();
   // Substitua <h1>Título</h1> por <h1>{t('page.title')}</h1>
   ```

---

## ⚙️ Etapa 2: Roteamento & Rastreio Dinâmico

1. **Detector Universal:**
   Ler o parâmetro da URL `?lang=es` ou a configuração do usuário no Supabase `profiles.language` e injetar no provider de contexto.

2. **Switcher Universal:**
   Garantir que o clique nas bandeirinhas do cabeçalho dispare `i18n.changeLanguage(target)`.

---

## 🤖 Etapa 3: A Cérebro da Fábrica (Supabase IA Integration)

1. **Modificação do Payload da Fábrica:**
   Abrir `src/pages/fabrica/Phase3ArtFactory.tsx`. 
   Passar explicitamente `language: i18n.language` no `supabase.functions.invoke("fabrica-generate-ad")`.

2. **Localização do Prompt (Edge Function):**
   Abrir `supabase/functions/fabrica-generate-ad/index.ts`.
   Adicionar o injetor de contexto regional:
   ```typescript
   const visualContext = lang === 'es' 
       ? "Avoid brazilian stereotypes, use latin american aesthetic (Cancun, Tulum, Mexico or Colombian high-end resorts vibe)" 
       : "Standard high-end travel vibe";
   ```

---

## 🧪 Etapa 4: Protocolo de Validação de Qualidade

- Validar se o seletor de moeda na Fábrica está espelhando automaticamente o idioma.
- Validar se o Checkout Internacional via Stripe está exibindo a moeda correta.

---

### 📜 Assinatura de Autoria
Este Playbook foi cunhado em 12 de maio de 2026 pelo assistente Antigravity para garantir o sucesso operacional absoluto da expansão do Canva Viagem. Que as vendas globais comecem! 🚀
