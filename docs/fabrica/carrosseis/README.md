# Fábrica de Carrosséis
Documentação central da ferramenta de carrosséis da Fábrica de Destinos.

## Ponto de retomada

- Data do handoff: 25/07/2026
- Código funcional: `src/components/fabrica/F1CarouselBuilder.tsx`
- Commit funcional: `55689a7c313e582d65f39ab7987ae65146e2114b`
- Branch: `main`
- Remotos confirmados no mesmo commit:
  - GitHub: `origin/main`
  - Lovable: `lovable/main`

## Documentos

1. [STATUS-ATUAL.md](./STATUS-ATUAL.md) — o que está pronto e como funciona.
2. [ARQUITETURA-E-DADOS.md](./ARQUITETURA-E-DADOS.md) — componentes, persistência e limites.
3. [GUIA-DE-DESIGN.md](./GUIA-DE-DESIGN.md) — objetivos, layouts e regras visuais.
4. [QA-E-VALIDACAO.md](./QA-E-VALIDACAO.md) — testes executados e checklist de regressão.
5. [PROXIMA-SESSAO.md](./PROXIMA-SESSAO.md) — próximos passos em ordem de prioridade.

## Regra de escopo

O carrossel é F2 e deve permanecer isolado do motor de geração de artes do Anúncio F1.
Mudanças em `F1CarouselBuilder.tsx` não autorizam alterações em
`src/lib/fabrica-compose-art.ts` ou `src/pages/fabrica/Phase3ArtFactory.tsx`.

## Como retomar

1. Atualizar `main` dos dois remotos.
2. Confirmar que não existem mudanças de outros agentes no arquivo-alvo.
3. Ler esta pasta antes de editar.
4. Alterar somente `F1CarouselBuilder.tsx` e arquivos explicitamente necessários.
5. Rodar ESLint, TypeScript, build e validação visual em 4:5.
6. Publicar o mesmo commit no GitHub e no Lovable.
