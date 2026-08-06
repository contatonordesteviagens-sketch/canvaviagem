# Histórico de Alterações e Melhorias - 06 de Agosto de 2026

## 1. Bug Resolvido: Encoding Corrompido
- **Problema**: Textos no `F1CarouselBuilder.tsx` estavam aparecendo com erro de encoding ("PRVIA", "OPES" com acentos bugados). Isso aconteceu porque os arquivos TypeScript estavam sendo salvos em Windows-1252 em vez de UTF-8 em edições passadas.
- **Solução**: 
  - Foi criado o script `fix-encoding-lossless.mjs` que leu e restaurou perfeitamente as strings corrompidas do projeto usando codificação híbrida e convertendo os buffers.
  - Expressões como `"PRVIA"` foram devidamente traduzidas e re-salvas como `"PRÉVIA"`.

## 2. Refinamento de UI: Apple Design & Minimalismo
Foram aplicadas as regras de design minimalista da Apple em componentes chave da Fábrica (Phase 4 / Phase 5):
- **Adicionar Novo Pacote**: O botão antes grande foi transformado num discreto botão circular (`+` amarelo) com animação sutil (scale-105 no hover) e um tooltip.
- **Botão de Excluir Site (Dashboard)**: O botão textual e agressivo de "Despublicar" foi convertido para um ícone limpo de `Lixeira` (Trash2), ficando harmonioso ao lado de "Editar Site". Texto do prompt simplificado.
- **Fluxo Guiado (CTA de Avanço)**: O botão "Avançar para Criar Anúncios (F1)" foi incluído acima da paleta de cores e no rodapé final da Fase 4, com efeitos de sombra e estilo guiado para otimizar o UX.

## 3. Correção do Fluxo de Deploy (Evitando o Vercel)
- **Problema**: Foi disparado um deploy acidental no Vercel (que quebrou) e misturou as branches locais.
- **Regra Reforçada**: O deploy oficial **nunca** ocorre pelo Vercel. O fluxo de produção é exclusivo do Lovable/GitHub.
- **Solução**: 
  - Sincronização forçada (`git push origin main:master -f` e `git push lovable main:master -f`).
  - Deploy final feito simultaneamente na branch `main` e `master` nos remotos `origin` e `lovable`, disparando o build no ambiente de produção correto do Lovable.

---
**Nota para os próximos agentes**:
- Sempre verificar `.agents/AGENTS.md` antes de qualquer edição.
- O motor de artes da F1 depende fortemente da arquitetura de Variantes (`TOTAL_VARIANTS` em `src/lib/fabrica-compose-art.ts`). Nunca altere o motor inteiro para corrigir uma arte isolada; modifique apenas a condicional da Variante específica.
- Nunca faça deploy usando o Vercel CLI na pasta raiz do projeto. Utilize apenas os comandos do Git integrados à arquitetura atual.
