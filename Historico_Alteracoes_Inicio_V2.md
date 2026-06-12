# Histórico de Alterações - Landing Page "Início" V2
**Data:** 05 de Junho de 2026
**Projeto:** Canva Viagem (Branch `main`)
**Diretório:** `C:\Users\win 10\Desktop\CANVA E FABRICA - JUNHO 26`

## 1. Ajustes de Preços e Textos (Pricing)
- **Remoção de Textos:** Removido "Total de R$598,20 no cartão", "À vista — maior economia" e "Menor preço do plano anual".
- **Atualização do Desconto:** O texto de desconto do plano anual foi simplificado de "Economize R$682,00 no anual à vista" para **"💰 Economize R$ 682 no anual"**.
- **Comparativo:** Nas tabelas de comparação da página inicial (tanto Mobile quanto Desktop), o custo do Canva Viagem foi alterado de "A partir de R$482/ano à vista" para **"A partir de R$ 97/mês"**.

## 2. Refinamento Visual e Responsividade (Mobile)
- **Preço em uma linha (Mobile):** No componente `PricingAccordion.tsx`, o texto "12x de R$ 49,85 ou R$ 482 à vista" foi ajustado com classes responsivas (`text-[13px] sm:text-[17px] whitespace-nowrap`) para garantir que caiba em uma única linha nas telas de celulares.
- **Suavização da Tag de Desconto:** Para diminuir o destaque da tag de economia, reduzimos o peso da fonte (de `800` para `700`) e aplicamos uma leve transparência (`opacity: 0.85`).
- **Respiro no Título (Antes e Depois):** O título "Chega de perder tempo no Canva" e sua descrição foram centralizados, recebendo uma margem inferior (`mb-12`) para que não ficassem colados aos cards. A frase final também recebeu uma margem superior (`mt-12`) de aproximadamente 2 centímetros para não encostar na base dos cards.

## 3. Player de Vídeo da Demonstração
- **Fundo Dinâmico:** A imagem estática do preview da plataforma foi substituída por uma tag nativa `<video autoPlay muted loop playsInline>`. Agora o vídeo (`demo-viagem.mp4`) roda silenciosamente no fundo em loop contínuo, usando a imagem `dashboardInterno` como *poster* provisório.
- **Botão de Play Fixo no Mobile:** O botão roxo ".demo-play" foi mantido sobre o vídeo. Para resolver o erro das "letras vazadas" no formato redondo do celular, o texto "Ver prévia da plataforma" foi ocultado na versão mobile (`display: none` em `.demo-play-text`), deixando apenas o círculo limpo com o ícone de Play nas telas pequenas. Nas telas desktop (`>= 768px`), o texto volta a aparecer perfeitamente formatado.

## 4. Gestão de Repositório e Resolução de Conflitos (Lovable vs Local)
- **Contexto:** Houve um aviso prévio de conflito onde atualizações de Inteligência Artificial do Lovable (no painel de anúncios `Phase3ArtFactory.tsx` e `FabricaDashboard.tsx`) estavam sendo acidentalmente sobrescritas pelos commits locais da landing page que estavam rodando em uma pasta desatualizada (`CANVA_VIAGEM_ESTAVEL_24_ABRIL`).
- **Resolução de Sincronia Segura:** A edição foi completamente transferida para o diretório de teste ativo (`C:\Users\win 10\Desktop\CANVA E FABRICA - JUNHO 26`). Um `git pull origin main` foi feito para garantir que o código estava nivelado com o Lovable.
- **Commit Cirúrgico:** Foi feito um push forçado da branch local garantindo a integridade dos arquivos da Fábrica criados pelo Lovable, empurrando exclusivamente os arquivos `Inicio.tsx`, `PricingAccordion.tsx` e `inicio-design.css`.

---
*Relatório gerado automaticamente pelo assistente de IA (Antigravity).*
