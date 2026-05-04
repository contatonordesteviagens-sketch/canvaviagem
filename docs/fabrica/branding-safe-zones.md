# Modernização: Branding Dinâmico e Safe Zones (Stories)

Este documento registra as melhorias feitas no motor de composição de anúncios para garantir conformidade com o Instagram e suporte a contatos dinâmicos.

## 📌 Contexto
Os anúncios gerados para Stories (9:16) estavam com o rodapé muito baixo, sendo cobertos pela interface do Instagram (campo de mensagem). Além disso, o sistema de contatos era estático, não permitindo escolher entre diferentes ícones (WhatsApp Verde, Insta Gradient, etc).

## 🚀 Melhorias Implementadas
- **Safe Zones (Instagram):** Formatos de **Story (9:16)** exigem obrigatoriamente um recuo de **250px-280px na base** e no topo.
    - Isso evita que os contatos fiquem escondidos atrás da barra de "Enviar Mensagem" do Instagram.
- **Contraste no Rodapé:** O texto do rodapé (branding) deve ser **SEMPRE BRANCO**. Mesmo que o anúncio tenha cores claras, o rodapé usa um "véu" (gradiente escuro) para garantir legibilidade, portanto a fonte preta não faz sentido ali.
- **Sincronização de Campos:** Novos campos como `footerContact1Icon` e `footerContact1Value` devem ser passados explicitamente para o compositor em todos os modos (IA, Foto, Custom).
- **Formatação de Dados:** Telefones devem seguir o padrão `(XX) 9 XXXX-XXXX` automaticamente durante a digitação para manter o profissionalismo.
- **Unificação do Motor:** O "Modo Foto" foi migrado para o compositor `composeTravelAd`, eliminando o uso de funções legadas que não suportavam os novos layouts.

## ⚠️ Lições e Erros Evitados
- **Git Push:** Mudanças locais no VS Code não refletem na Lovable sem o push manual.
- **Hierarquia de Desenho:** O branding deve ser a ÚLTIMA coisa a ser desenhada no Canvas para garantir que fique por cima de gradientes ou fotos.
- **Indisponibilidade de Logo:** Se o usuário não subir um logo, o sistema deve usar o nome da agência como texto estilizado (wordmark) para não deixar o anúncio "vazio".

---
*Atualizado em: 04/05/2026*
