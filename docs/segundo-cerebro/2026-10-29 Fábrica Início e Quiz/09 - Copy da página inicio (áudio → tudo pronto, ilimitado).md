---
tags: [canva-viagem, copy, landing, inicio, squad-rocha]
criado: 2026-10-29
---
# Copy da `/inicio` — "Mande um áudio. Receba tudo pronto."
← [[00 - Índice (comece aqui)]]

## Diagnóstico (Copy Squad Rocha)
- **Público:** dono de agência pequena / agente autônomo, sem designer, sem social media, sem tempo. Leigo.
- **Consciência:** sabe que precisa postar e anunciar mais; não sabe que existe algo que faz *tudo* a partir de um áudio.
- **Líder:** Todd Brown (Big Idea + mecanismo). Apoio: Brunson (gancho → história → oferta), Schwartz (consciência).
- **Big Idea:** *Você fala o pacote como fala para um cliente. A Fábrica devolve a agência inteira pronta — anúncio, carrossel, stories, site, vídeo — com a sua logo. Sem limite.*
- **Mecanismo:** áudio (destino, dias, valor) + logo → a Fábrica monta e aplica a marca em tudo → você baixa, posta, manda no WhatsApp.
- **Regras aplicadas:** sem "grátis" (não há teste grátis), sem quantidades (250/400), sem depoimentos não confirmados, sem "CRM/lead/funil" no texto para o leigo ("seus clientes", "pedidos de orçamento").

## Estrutura e textos finais
1. **Hero** — Eyebrow: *Para agências de viagens sem equipe de marketing*. H1: **Mande um áudio. Receba sua agência inteira pronta.** Sub: *Fale o destino, os dias e o valor — do jeito que você fala com um cliente. Em minutos saem o anúncio, o carrossel, os stories, a página do pacote e os vídeos, tudo com a sua logo.* Campo: destino + botão **Criar agora**; botão grande **Gravar um áudio** (vai para login → quiz). Abaixo: faixa infinita de carrosséis reais com selo **Ilimitado · sem créditos**.
2. **Escolha o que você precisa criar hoje** — abas Principais / Vídeos / Artes / Sites / IA / Venda (grade antiga + card de Site).
3. **Como funciona (3 passos, animados)** — 01 *Mande um áudio ou digite* (onda de voz) · 02 *Receba tudo pronto* (anúncio, carrossel, site e vídeo caindo em cascata com a logo) · 03 *Publique e venda* (baixar → Instagram → WhatsApp).
4. **Ilimitado** — *Sem créditos. Sem contador. Sem "acabou sua cota".* Cena: terça 30 stories de Gramado, quarta 12 anúncios de Cancún, sábado o site de novo porque o preço mudou. *Quem posta mais aparece mais; quem aparece mais fecha mais.* Escassez crível: **o ilimitado fica travado para quem assina agora** — planos novos podem vir com limite; quem já está dentro mantém. ⚠ Lucas confirma essa promessa.
5. **Tudo o que uma equipe faria** — imagem da mulher no notebook com os chips Anúncios · Vídeos · Sites · Clientes.
6. **Seu site pronto** — demonstração real dos 3 modelos (Computador/Celular), reaproveitada da página de sites.
7. **Sua logo em tudo** — *Envie a logo uma vez. Ela entra no site, nos anúncios, nos carrosséis e nos vídeos.* Área "Arraste sua logo ou toque para enviar" → login → quiz (a logo fica guardada no navegador).
8. **1 ano de conteúdo pronto** — 2 GIFs dos celulares. *Nos dias em que você não quiser criar nada, já tem o que postar: vídeos e artes por destino, com calendário.*
9. **Antes × depois** — imagem corrigida (não corta mais) + tabela comparativa.
10. **Como a Fábrica acerta** — 3 linhas simples: junta destino + design + texto + sua marca · gera várias versões · você escolhe a melhor (ou pega a primeira). Sem gráfico de "nota de conversão" (número inventado).
11. **Dúvidas** — É ilimitado mesmo? Preciso saber design? Funciona no celular? Preciso gravar áudio? E se eu não gostar?
12. **CTA final** — *Pare de postar no improviso. Mande seu primeiro áudio.* Botão **Comece agora**. Garantia de 7 dias.

## Status (29/10, sem commit)
- `src/pages/InicioCreme.tsx` reescrita com a estrutura acima; animações novas em `src/components/cv-cream/cream.css` (onda de voz, cascata, badge da logo, bolinha viajando).
- Reaproveitado da página antiga: `hero_dashboard.jpg` (mulher no notebook) com chips flutuantes; grade de ferramentas (`showcase-*.png`) agora com abas que filtram de verdade e aba **Sites**; demonstração dos 3 sites (`siteOfferDemos`, iframe `srcDoc`) com modo Celular corrigido (moldura 360px, cartões em rolagem lateral); faixa infinita `travel-mobile-marquee`; vídeo `carousel-morph.mp4`; GIFs do "1 ano de conteúdo"; VSL `R2MyCdox--I` com clique para tocar.
- Removidos: grade feia "Cancún" do topo, gráfico "nota de conversão" (número inventado), depoimentos não confirmados, "Começar — é grátis".
- Quiz (`Onboarding.tsx`): intro e telas falam de áudio → tudo pronto; sem "NOTA 9.7" e sem depoimento falso; lista "o que está saindo" no carregamento; termina em `/checkout`.
- Testado no navegador (computador 1366 e celular 390): sem rolagem lateral, abas filtram, demo troca de site, FAQ abre, envio de logo guarda no navegador e leva ao login, quiz completo em 18 telas → `/checkout?plano=annual`. `tsc` 0 erros, build OK.

## Decisões pedidas pelo Lucas
- **"Começar — é grátis"** sai: não existe teste grátis e o Squad proíbe. Entra **Comece agora** (cabeçalho) e **Gravar um áudio / Criar agora** (hero).
- **Captura de e-mail:** o login antes do quiz já captura o e-mail (Google ou e-mail). Quem para no quiz ou no checkout entra numa lista de recuperação no painel de e-mail (Brevo). Não precisa prometer nada "grátis" para isso.
