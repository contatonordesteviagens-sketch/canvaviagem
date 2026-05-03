# Corrigir V0 (1/1/2): inverter cores e forçar texto nas pílulas

## Objetivo
Atualizar o prompt **1/1/2 V0** para casar com a especificação revisada do usuário:
- **Bottom 55%** passa a usar a **cor PRIMÁRIA** como fundo (não a secundária).
- **Top pill** muda para a **cor SECUNDÁRIA** com texto escuro.
- **Headline** continua branco puro, agora sobre o fundo primário.
- **4 pílulas brancas** ganham regra crítica: NUNCA podem ficar vazias — sempre renderizar texto escuro + ícone.
- **Bloco de preço** passa a usar a **cor SECUNDÁRIA** como fundo, com TODO texto em DARK (alto contraste sobre fundo claro).
- **Badge da parcela** vira escuro (`primaryHex`) com texto bright.
- **Footer PIX** vira faixa escura (`primaryHex`) com texto bright.

## Arquivo
`supabase/functions/fabrica-generate-ad/master-prompts.ts` — substituir o bloco do prompt V0 (linhas ~520-550) preservando o cabeçalho de isolamento, safe zones e top half (foto).

## Regras adicionais reforçadas no prompt
- "🚨 CRITICAL RULE FOR INCLUSIONS: every white pill MUST contain dark text + icon. NEVER leave any pill empty."
- Atualizar PROIBIDOS: incluir "pílulas brancas vazias" e atualizar referência V4.

## Sem mudanças
V2, V4 do 1/1/2, V0 do 1/1/1, front-end, `index.ts` — todos preservados.
