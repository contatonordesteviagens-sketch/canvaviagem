# Log da Mega-Intervenção: Refatoração Global da IA Pura

**Data da Execução:** 30 de Maio de 2026
**Objetivo:** Estancar gargalos críticos de segurança, performance, armazenamento e ux relatados no dossiê de auditoria da IA Pura do Canva Viagem.

---

## 🛡️ 1. Segurança e Endpoints (Chave Ocultada)
- **Ação Executada:** A chave hardcoded do Gemini (`AIza...`) foi permanentemente apagada do front-end (`Phase3ArtFactory.tsx`).
- **Novo Fluxo:** O front-end passa a usar a chave customizada salva no `localStorage` pelo usuário, ou delega o fallback para as chaves ambientais (*secrets*) da Edge Function.
- **Lovable AI Gateway:** A Edge Function foi migrada da rota legada (`/v1/chat/completions`) para a rota correta (`/v1/images/generations`). O payload foi reestruturado para receber o formato `b64_json`.
- **Prevenção de Cliques Duplos:** Injetada a trava de idempotência `if (loading && genMode === "ai") return;` na função `generate` para impedir concorrência predatória de recursos no clique.

## 🚀 2. Performance e UX (Lotes Simultâneos)
- **Lote A/B Paralelizado:** As três requisições sequenciais foram unificadas em um `Promise.allSettled()`. Agora o Supabase recebe o *batch* simultaneamente, dividindo o tempo de loading por 3.
- **Timeout Protetivo (AbortController/Race):** Adicionado um `Promise.race` com limite máximo de 25 segundos para evitar que a UI congele infinitamente esperando respostas presas das APIs do Google ou Lovable.
- **Mensagem de Filtro NSFW Humanizada:** Erros crônicos em praias e fotos artísticas não retornam mais a genérica "Falta de créditos". O sistema intercepta erros vazios da IA e devolve o texto claro: *"Imagem bloqueada pelos filtros de segurança da IA. Tente outro termo."*

## 💾 3. Migração de Storage (Fim do LocalStorage)
- **A Bomba Relógio:** Anteriormente, artes de até 3MB em Base64 eram mantidas no React State e `localStorage`, estourando a quota do navegador rapidamente.
- **Upload Imediato:** Após o resize da imagem, ela agora é lida e convertida para um `Blob` localmente, e então feito um UPLOAD imediato para o bucket público `thumbnails` do Supabase.
- **Armazenamento Seguro:** O `FabricaState` (`cleanBackgroundForSite`) passa a salvar unicamente a **URL Remota e pública** do arquivo, tornando as sessões muito mais leves e impedindo `QuotaExceededError`. O `crossOrigin="anonymous"` pré-existente já garante que o motor 2D Canvas use a URL remota sem problemas de CORS.

## 📐 4. Prompts e Aspect Ratio (Fim dos Cortes Horizontais)
- **Comunicação Direta de Formato:** Inseridos parâmetros `{ aspectRatio: "9:16" }` no payload para os modelos que suportam natively (Gemini 2+ e Lovable API).
- **Hard-Prompting para Stories:** Um aviso letal e inegociável foi adicionado ao topo do template dos stories:
  > *"CRITICAL REQUIREMENT: You MUST generate a STRICTLY VERTICAL portrait image (9:16 aspect ratio). DO NOT generate square images."*

---

> Tudo foi commitado e teve o `push` efetuado na branch principal para acionar a pipeline da Vercel. O deploy da Edge Function também foi concluído via CLI do Supabase local. A fundação de geração da IA Pura agora suporta escala sem vazar chaves nem memória.
