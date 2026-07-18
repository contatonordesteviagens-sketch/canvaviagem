# Arquitetura de projetos e sites

Este documento define a fonte de verdade para múltiplas agências na mesma conta do Canva Viagem.

## Princípio

Um **projeto** representa uma agência independente. Nome, logo, contatos, cores, pacotes, configurações do site, modelo escolhido e dados de criação da Fábrica pertencem ao projeto ativo. Trocar de projeto deve substituir o snapshot inteiro; nunca completar campos usando outro projeto.

Um **site publicado** é a projeção pública de um projeto. Ele não é a fonte primária de edição, mas pode ser usado para recuperar projetos antigos que tenham publicação e não tenham snapshot salvo.

## Identidades canônicas

| Entidade | Tabela | Identidade | Função |
|---|---|---|---|
| Projeto editável | `fabrica_diagnosticos` | `id` UUID | Snapshot completo da agência |
| Site publicado | `public_sites` | `id` slug | HTML servido em `{slug}.canvaviagem.com` |
| Vínculo | `public_sites.project_id` | UUID do projeto | Une publicação e projeto sem confundir slug com UUID |

Regras:

- `public_sites.id` nunca deve receber `user.id` nem UUID de projeto; recebe somente o slug público.
- `public_sites.project_id` recebe o UUID real retornado ao persistir o projeto.
- Consultas devem filtrar explicitamente `user_id` ou `owner_id`, além das políticas RLS.
- O idioma também faz parte da consulta de publicações (`pt-BR` ou `es`).

## Fluxo de criação

```text
Criar novo projeto/site
        ↓
estado base profundo + ID temporário proj_*
        ↓
resolução determinística proj_* → UUID
        ↓
UPSERT idempotente em fabrica_diagnosticos
        ↓
cache local e contexto migram proj_* → UUID
        ↓
lista de projetos é invalidada e atualizada
```

O estado base precisa ser clonado profundamente. Não pode conservar nome, logo, contato, pacote, anúncio, mídia, URL pública, cor personalizada ou configuração do projeto anterior.

## Salvar e carregar

- Salvamento manual e autosave usam o mesmo utilitário de persistência.
- Salvamentos do mesmo projeto são serializados; uma resposta antiga não pode sobrescrever o estado mais novo nem trocar o ponteiro do projeto ativo.
- Antes de trocar, criar ou restaurar um projeto, alterações pendentes do projeto atual são descarregadas na fila de persistência.
- A hidratação assíncrona confirma novamente o projeto ativo antes de aplicar o snapshot, evitando que uma resposta tardia misture duas agências.
- O snapshot salvo contém o `projectId` resolvido.
- Ao selecionar um projeto, o contexto carrega o snapshot completo e limpa os históricos de desfazer/refazer.
- Mídia pesada do cache local só pode complementar o snapshot quando o ID do cache e o ID do projeto são idênticos.
- Imagens inline (`data:`) de hero, seção sobre e pacotes ficam em um cache pesado separado por projeto; o JSON principal permanece leve e essas mídias nunca são mescladas entre agências.
- URLs públicas de imagens podem ser sincronizadas na nuvem; base64 pesado permanece no cache local e deve ser convertido/enviado pelo fluxo de publicação.
- Alterações invalidam a consulta `fabrica-diagnosticos`, evitando listas desatualizadas.

## Cache local v2

O cache é separado por idioma, usuário e projeto:

```text
fabrica-active-project-v2:{locale}:{userId}
fabrica-context-v2:{locale}:{userId}:{projectId}
fabrica-gallery-v2:{locale}:{userId}:{projectId}
fabrica-heavy-v2:{locale}:{userId}:{projectId}:{campo}
```

O ponteiro ativo permite reabrir o último projeto correto. Chaves v1 existem somente como ponte de migração; dados de dois projetos diferentes não podem ser mesclados por prioridade de campo.

## Publicação

1. Persistir o projeto e obter um UUID válido.
2. Resolver e validar o slug público.
3. Confirmar que o slug não pertence a outro usuário nem a outro projeto da mesma conta.
4. Gerar o HTML com o estado daquele projeto.
5. Fazer upsert em `public_sites` usando o slug como `id` e o UUID como `project_id`.
6. Salvar a URL final no snapshot do mesmo projeto.
7. Invalidar as listas relacionadas.

Um domínio já ligado ao projeto A não pode ser silenciosamente tomado pelo projeto B, mesmo quando ambos pertencem ao mesmo usuário. Transferência de domínio exige um fluxo explícito futuro.

O formulário público e sua integração com o CRM são contratos protegidos e não foram alterados por esta arquitetura.

## Projetos antigos recuperados

Há contas com linhas em `public_sites` sem projeto correspondente em `fabrica_diagnosticos`. Para não esconder esses sites do seletor:

- a lista une projetos salvos e publicações do mesmo proprietário;
- associa primeiro por `project_id` e depois por slug/URL exatos;
- busca o HTML somente das publicações órfãs;
- extrai dados visíveis de forma inerte com `DOMParser` e `JSON.parse`, sem executar scripts ou usar `eval`;
- mostra o item como **Recuperado**;
- ao abrir, cria um projeto real próprio e religa a publicação ao novo UUID.

A recuperação é de melhor esforço. Conteúdo visível no HTML — agência, marca, seções, pacotes e contatos — pode ser restaurado. Históricos internos antigos que nunca foram publicados, como certas artes do F1, não podem ser inventados.

## Exclusão e despublicação

- **Despublicar:** remove a linha pública e limpa a URL salva, mas preserva o projeto editável.
- **Excluir projeto:** após confirmação explícita, remove publicações vinculadas e o snapshot do projeto; em seguida cria um estado novo e isolado.
- Toda exclusão deve ser limitada ao proprietário autenticado.
- Não usar exclusão como parte do simples ato de trocar de projeto.

## Critérios de regressão

Antes de publicar mudanças neste fluxo, confirmar:

1. O painel e o seletor F2 exibem o mesmo conjunto de projetos/sites recuperáveis.
2. Criar novo site não herda nome, logo, pacotes, cores ou URL.
3. Trocar A → B → A restaura os snapshots corretos.
4. Recarregar a página mantém o projeto ativo.
5. Publicar usa slug público e UUID de projeto nos campos corretos.
6. Despublicar não apaga o projeto.
7. Excluir um projeto não afeta projetos de outra conta.
8. Formulário, CTA e envio ao CRM continuam funcionando sem mudança de contrato.
9. O fluxo permanece utilizável em largura mobile sem rolagem horizontal.

Última atualização: 16 de julho de 2026.
