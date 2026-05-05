# 🛡️ Blindagem do Motor de Renderização (Ad Factory)

Este documento descreve as técnicas de "blindagem" implementadas no arquivo `src/lib/fabrica-compose-art.ts` para garantir estabilidade visual e profissionalismo nas artes geradas.

## 1. Proteção de Transbordo de Texto (Overflow Protection)

Foram implementadas duas funções críticas para garantir que o texto do usuário nunca saia do quadro:

### `safeFillText`
Diferente do `ctx.fillText` padrão, esta função verifica se o texto cabe na largura máxima (`maxWidth`). Caso não caiba, ela **reduz o tamanho da fonte dinamicamente** pixel a pixel até que o texto se ajuste perfeitamente ao container, respeitando um tamanho mínimo de segurança.

**Uso:**
```typescript
safeFillText(ctx, "Texto Longo de Destino", x, y, maxWidth, minSize);
```

### `wrapTextSafe`
Utilizada para blocos de texto multi-linha (como os benefícios/highlights). Ela quebra o texto em linhas e, se uma palavra individual for mais larga que o container, também aplica o encolhimento de fonte.

## 2. Higienização de Branding (Branding Hygiene)

O sistema foi blindado para nunca exibir placeholders genéricos como "Sua Agência".

- **Regra de Ouro**: Se o usuário não forneceu uma `logoUrl` E não configurou contatos, a função `drawFinalBranding` retorna imediatamente, não renderizando nenhum rodapé.
- **Wordmark Fallback**: Se houver contatos mas não houver logo, o sistema tenta renderizar o nome da agência (`agencyName`). Se este também estiver vazio, o espaço da logo fica limpo, sem textos genéricos.

## 3. Zonas de Segurança (Safe Zones)

- **Instagram Stories**: O rodapé foi subido para `340px` do fundo em layouts de Story para evitar que a barra de resposta e o nome do usuário do Instagram cubram as informações de contato da agência.
