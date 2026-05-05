# 🚀 PROMPT MESTRE PARA REFORMA DA IA

Copie e cole este comando integralmente no chat do Lovable:

---

"Lovable, realize uma reforma completa na lógica de geração de imagens do meu projeto. Você deve reescrever os arquivos `master-prompts.ts` e `supabase/functions/fabrica-generate-ad/index.ts` seguindo estas diretrizes rigorosas:

**I. Regras de Headline:**
- Use lógica de programação para garantir que o título seja SEMPRE uma string completa: 'Pacote para [Destino]'. 
- A IA deve renderizar o texto com fonte 'Montserrat' ou 'Oswald' Extra Bold, com contraste absoluto sobre o fundo (use sombras se necessário).

**II. Limpeza do Card Amarelo:**
- O prompt deve ser explícito: 'Yellow price tag with clean design. NO repetitive icons. Show only Price, Installments and Duration'. 
- Remova qualquer instrução que peça ícones de transporte de forma redundante dentro do card.

**III. Filtro de Conteúdo Visual:**
- Adicione a instrução '(STRICTLY NO PEOPLE, NO MODELS)' em todas as chamadas de imagem. O usuário exige apenas paisagens paradisíacas e monumentos dos destinos.

**IV. Controle de Variação (Fim das artes repetidas):**
- No arquivo `index.ts`, o campo `variation` enviado à API de imagem deve ser gerado via `Math.floor(Math.random() * 999999)`. 
- Isso deve ser feito DENTRO da função de geração para garantir que cada arte gerada seja 100% única em cada clique.

**V. Ajuste de Formato e Safe Zone:**
- Configure os layouts para que a IA entenda a diferença de espaço entre 'square' (1:1) e 'story' (9:16).
- Respeite margens de segurança: nada de texto ou preço encostado nas bordas. No Story, centralize o conteúdo verticalmente.

Execute estas mudanças agora e me confirme quando o sistema estiver limpo, profissional e sem erros de letras cortadas ou ícones duplicados."
