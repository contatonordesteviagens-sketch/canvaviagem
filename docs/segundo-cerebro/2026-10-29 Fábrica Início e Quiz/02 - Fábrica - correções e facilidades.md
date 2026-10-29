---
tags: [canva-viagem, fabrica, ux, bugs]
criado: 2026-10-29
---
# Fábrica — correções e facilidades
← [[00 - Índice (comece aqui)]]

Testado logado como admin em `canvaviagem.com/fabrica`: áudio, anúncio (artes), carrossel, site, CRM e pacotes.

## Bug crítico: artes quebradas para todos os clientes
- **Causa:** presets globais da tabela `fabrica_art_tweak_presets` foram salvos com conteúdo de Fernando de Noronha. A V6 escondia o preço, a V2 forçava "PACOTE FERNANDO DE NORONHA" e a V3 removia o título — para **todo mundo**.
- **Correção:** `sanitizeGlobalArtTweaks()` em `src/lib/fabrica-art-tweak-presets.ts` remove textos fixos dos presets globais; `fabrica-art-recorder.ts` ignora o preset quando ele esconde um preço.
- Backup dos presets antes da mudança: `presets_backup.json` (scratchpad da sessão).
- Motor (`src/lib/fabrica-compose-art.ts`): V8 mostra "10x de R$ 149,90" quando parcelado; V7/V8 calculam o total com `resolveTotalStr`. **V0–V5 não foram tocadas** (regra).

## Novidades para o leigo
- **Primeiros passos** (`FabricaFirstSteps.tsx`) no Painel: checklist de 4 itens (perfil com WhatsApp válido → pacote → anúncio → site) com barra de progresso e botão "ir" em cada item.
- **Mini-tutorial por tela** (`FabricaStepGuide.tsx`): "Como funciona esta tela?" com 3 passos e uma dica em Anúncio, Carrossel, Site, CRM e Pacotes. Pode fechar; lembra a escolha.
- **Pacote em uma frase:** digitar `Porto de Galinhas, 5 dias, R$ 1.997, hotel + transfer + passeios` cria o pacote pronto.
- **WhatsApp incompleto** agora é detectado e o perfil abre sozinho com aviso vermelho.
- Linguagem: jargões trocados ("F1/F2", "draft", "Planos" → **Meus Pacotes**, "Mostrar no site", "Baixar esta arte").

## Anúncio (artes) — `Phase3ArtFactory.tsx`
- Busca de fotos automática ao abrir e primeira foto já selecionada.
- Etapas numeradas: Formato → 1 De onde vem a foto → 2 Escolha a foto → 3 Textos e preço; botões de modelo 1–9 + "Variar".
- Total recalcula ao mudar preço/parcelas; legenda sai com "R$".
- Ajuste fino: "Aplicar só nesta arte" é o botão principal; "Salvar como padrão" (afeta todos) ficou secundário.

## Carrossel — `F1CarouselBuilder.tsx`
- Buscar foto num slide não troca mais as fotos de todos.
- Legenda com aberturas variadas, "Gerar outra" e "Copiar legenda".
- Pede confirmação antes de apagar textos editados ao trocar estilo/quantidade de slides.
- Progresso no download ("Preparando 2/5…"); no celular oferece compartilhar para salvar na galeria.
- 4 formatos visíveis + "Ver mais formatos".

## Site — `Phase4LandingBuilder.tsx` + `fabrica-html-export.ts`
- Um botão só: **"Publicar meu site"** / "Salvar alterações no meu site" (confirma se mudar o endereço).
- Aviso de pacotes em rascunho que não aparecem no site, com botão "Mostrar no site".
- Números de exemplo ("15k+ viajantes") **nunca vão para o site publicado**; na prévia aparecem marcados como exemplo.
- Prévia não dispara pixel/Analytics.

## CRM — `Phase5Dashboard.tsx`
- Se não há leads novos mas há antigos, abre direto a aba "Leads antigos (N)". **A lógica de leads não foi alterada** (regra).
- Contagem de leads novos sem duplicar lead do formulário com lead legado (`useFabricaMetrics.ts`).

## Áudio — `VoiceOnboarding.tsx` + função `fabrica-transcribe-audio`
- Áudio não apaga mais os destinos já cadastrados.
- Transcrição em espanhol quando a pessoa está em `/es` (precisa publicar a função — ver [[04 - Regras, pendências e como publicar]]).

## Atalhos na home do portal
- `QuickStartActions.tsx`: "Criar um anúncio", "Pegar um post pronto", "Ver meus clientes (N novos)".
