# Modernização: Branding Dinâmico e Safe Zones (Stories)

Este documento registra as melhorias feitas no motor de composição de anúncios para garantir conformidade com o Instagram e suporte a contatos dinâmicos.

## 📌 Contexto
Os anúncios gerados para Stories (9:16) estavam com o rodapé muito baixo, sendo cobertos pela interface do Instagram (campo de mensagem). Além disso, o sistema de contatos era estático, não permitindo escolher entre diferentes ícones (WhatsApp Verde, Insta Gradient, etc).

## 🚀 Melhorias Implementadas
1.  **Safe Zone de 280px:** Todos os anúncios em formato Story agora possuem um recuo obrigatório de 280px na base para o branding.
2.  **Contatos Dinâmicos:** Suporte total aos campos `footerContact1` e `footerContact2` configurados no `Phase3ArtFactory`.
3.  **Unificação do Motor:** O "Modo Foto" foi migrado para o compositor `composeTravelAd`, eliminando o uso de funções legadas que não suportavam os novos layouts.

## ⚠️ Lições e Erros Evitados
- **Git Push:** Mudanças locais no VS Code não refletem na Lovable sem o push manual.
- **Hierarquia de Desenho:** O branding deve ser a ÚLTIMA coisa a ser desenhada no Canvas para garantir que fique por cima de gradientes ou fotos.
- **Indisponibilidade de Logo:** Se o usuário não subir um logo, o sistema deve usar o nome da agência como texto estilizado (wordmark) para não deixar o anúncio "vazio".

---
*Atualizado em: 04/05/2026*
