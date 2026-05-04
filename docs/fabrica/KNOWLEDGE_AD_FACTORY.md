# 🚀 Manual de Operação e Contexto: Fábrica de Anúncios (Canva Viagem)

Este documento serve como a "memória mestre" para a I.A. e desenvolvedores que operarem neste repositório. Ele detalha as funcionalidades, ajustes recentes e protocolos de teste para a **Fábrica de Anúncios**.

## 🔑 Acesso e Credenciais
- **URL Pública**: `https://canvaviagem.com/fabrica` (Acesso livre desbloqueado).
- **Senha Administrativa (se solicitada)**: `rickbread`.
- **Acesso Restrito**: O gate de senha foi removido para facilitar o lançamento, mas a estrutura de `ComingSoonGate` ainda existe no código para manutenções futuras.

---

## 🛠️ O que foi feito recentemente (Maio 2026)
1. **Motor de Branding Profissional**:
   - Ícones de WhatsApp e Instagram com traços finos e suaves.
   - Sistema de recorte real (cutout) para que o ícone fure o fundo sem corrupção visual.
   - Escalonamento inteligente: textos de contato encolhem automaticamente para não tocar no logo.
2. **Estabilização de Dados**:
   - Máscara de preço robusta (evita erros de centavos e prefixos 100.).
   - Sincronização de campos de destino sem concatenação.
   - Formatação automática de parcelas ("10x de R$...").
3. **Qualidade Visual**:
   - IA configurada para gerar fundos de "Luxo/Premium" com espaço negativo para textos.
   - Suporte a variações de layout (Square V0-V4 e Story) com rotação automática.
   - Suporte a cores customizadas e inversão de contraste (texto preto em fundos claros).

---

## 🧪 Protocolo de Teste Exaustivo (Deep Test) - RESULTADOS VERIFICADOS (04/Mai)
O sistema foi submetido a um teste de estresse com as seguintes configurações:
- **Gramado**, **OFERTA ESPECIAL**, **Pacote {destino}**, **5 dias**.
- **Preço**: 10x de R$ 149,00.
- **Banner PIX**: "5% OFF À VISTA NO PIX" (Personalizado).
- **Cores**: Azul (#0715cf) e Amarelo (#FCD34D).

### Conclusões do Teste:
- ✅ **Sincronização de Dados**: O template `{destino}` e os valores de preço estão 100% funcionais.
- ✅ **Estética Story**: O formato Stories 9:16 é o mais completo, exibindo todos os gatilhos e ícones.
- ✅ **Branding Profissional**: Os ícones finos e fonte suave (500) garantem um visual premium.
- ⚠️ **Variabilidade de Layout**: Alguns layouts Square simplificados priorizam o preço e destino, omitindo a duração se o espaço for curto. O motor foi ajustado para forçar a exibição da duração sempre que `travelPeriod` for fornecido.
- ⚠️ **Hierarquia de Cores**: Em alguns templates, a cor secundária (amarelo) domina o card de preço para máximo contraste, conforme padrão de mercado (CVC Style).

### Como Repetir o Teste:
1. Vá para Phase 3.
2. Configure os campos citados acima.
3. Gere 3 variações de Feed e 2 de Story.
4. Verifique se o rodapé (contatos) está nítido e elegante.

---

## 🎨 Princípios de Design (Guidelines) - ESTÉTICA OBRIGATÓRIA
- **Rodapé de Branding**: Deve ser SEMPRE um **véu gradiente escuro** com **texto branco em negrito (700)**.
  - ❌ NUNCA use textos pretos ou fundos claros no rodapé.
  - **Margem de Segurança (Stories)**: O rodapé começa a **580px** do fundo da imagem para garantir separação TOTAL de qualquer elemento do Instagram.
  - **Zonas de Não-Sobreposição**: O motor garante que o card de preço (Price Card) termine antes de 1340px de altura (panelBottom - 580) para nunca tocar no branding.
- **Ícones**: Devem ter espessura visível (lineWidth ~0.10) e sombra projetada.
- **Minimalismo**: Menos é mais. Os contatos devem ser discretos e elegantes, mas sempre legíveis.
- **Premium**: A IA nunca deve gerar textos ou logos próprios. Ela gera a fotografia, o Canvas gera a arte final.

---
**Status Atual**: Produção Estável (Ready to Launch)
**Última Atualização**: 04 de Maio de 2026 por Antigravity.
