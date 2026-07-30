# Editor de Artes (Admin) — arrastar no canvas + presets globais

## O que você vai poder fazer

1. Gerar a arte normalmente na Fábrica.
2. Como admin, aparece um botão **"Ajustar arte"** no card (invisível para os outros usuários).
3. Abre um editor em tela cheia com a arte. Cada elemento (título, preço, ícone, rodapé, faixa PIX, logo, badge...) fica selecionável: clica e arrasta para mover, alças nos cantos para aumentar/diminuir.
4. Dois botões de salvar:
   - **Salvar só nesta arte** — muda apenas aquela imagem.
   - **Definir como padrão desta variação** — a partir daí, toda arte gerada naquela variação/categoria/formato já sai ajustada, para todos os usuários.
5. Um selo discreto no card mostra qual variação gerou a arte (ex: `V3 · Oferta · 1:1`) — só o admin vê.

## Como isso funciona por baixo (resumo técnico)

O motor de artes hoje desenha tudo com coordenadas fixas no código, e não "sabe" que existe um título ou um preço — só pinta pixels. Para permitir arrastar, precisamos ensinar o motor a **registrar cada elemento que desenha**.

A ideia é uma camada fina de ajustes, sem reescrever o motor:

```text
Motor desenha  →  registra { id: "price", x, y, w, h }  →  Editor mostra caixas arrastáveis
Editor salva   →  { price: { dx: -20, dy: 14, scale: 1.15 } }
Motor redesenha aplicando os deslocamentos antes de pintar
```

Ou seja: nada de coordenada nova hardcoded. Cada ponto de desenho passa a consultar um helper `tweak("price", x, y, size)` que devolve a posição já corrigida, e ao mesmo tempo reporta a caixa do elemento para o editor.

### Escopo de instrumentação

O motor tem ~5.500 linhas e 9 variações de Oferta + 5 de Experiência. Instrumentar tudo de uma vez é arriscado. Proposta em etapas:

- **Etapa 1:** infra (registro de elementos + aplicação de ajustes) + editor + persistência, instrumentando **uma variação piloto** (sugiro V0 Oferta).
- **Etapa 2:** você valida o editor no piloto e eu replico a instrumentação nas demais variações, uma a uma, sem tocar na lógica de layout existente.

Isso respeita a regra de ouro do projeto: nunca refatorar V0–V5 para atender variação nova.

## Onde os ajustes ficam guardados

Nova tabela no banco:

| Campo | Uso |
|---|---|
| `variant`, `category`, `format` | identifica a variação (ex: 3 / oferta / 1:1) |
| `tweaks` (jsonb) | mapa `{ elementId: { dx, dy, scale } }` |

- **Leitura:** liberada para todo mundo (é o que faz o ajuste valer para os usuários).
- **Escrita:** somente para quem tem role `admin` no banco — não é checagem só de front-end.

Ajustes "só nesta arte" ficam junto do registro da arte gerada no projeto, sem ir para a tabela global.

## Controle de acesso

- Botão e editor só renderizam quando `isAdmin` do contexto de autenticação é verdadeiro (a conta `lucashenriquephd@gmail.com` já é reconhecida como admin).
- A proteção real está na política do banco: mesmo que alguém force o front, não consegue gravar preset.

## Arquivos envolvidos

| Arquivo | Mudança |
|---|---|
| `src/lib/fabrica-art-tweaks.ts` (novo) | tipos dos ajustes, helper `tweak()`, registro de elementos |
| `src/lib/fabrica-compose-art.ts` | aceitar `tweaks` + `onElement` nas opções; instrumentar a variação piloto |
| `src/components/fabrica/ArtTweakEditor.tsx` (novo) | editor com arrastar/redimensionar, preview ao vivo, undo/reset |
| `src/pages/fabrica/Phase3ArtFactory.tsx` | guardar a variação junto da arte, selo admin, botão "Ajustar arte" |
| `src/hooks/useArtTweakPresets.ts` (novo) | carregar/salvar presets do banco com cache |
| Migration | tabela de presets + RLS admin-only para escrita |

## Fora do escopo desta etapa

- Editar texto/conteúdo dentro do editor (só posição e tamanho).
- Adicionar ou remover elementos novos na arte.
- Instrumentar todas as variações (fica para a etapa 2, após sua validação do piloto).
