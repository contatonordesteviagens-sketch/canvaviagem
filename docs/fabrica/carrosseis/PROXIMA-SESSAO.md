# Próxima sessão
## Prioridade 1 — persistência em nuvem

Substituir ou complementar o `localStorage` por uma tabela com RLS, mantendo
`project_id` e `package_id` obrigatórios. A migração deve importar rascunhos
locais somente mediante confirmação do usuário.

Critérios:

- não misturar contas;
- não misturar projetos;
- não misturar pacotes;
- recuperar o mesmo carrossel em outro dispositivo;
- preservar imagens e edições manuais;
- manter histórico ou recuperação de versão.

## Prioridade 2 — testes automatizados

Criar testes para:

- migração de `textColor`;
- troca de objetivo claro/escuro;
- troca para FAQ com cor principal clara;
- chave de armazenamento por projeto e pacote;
- sequência de 3, 4, 5 e 6 slides;
- alternância da Oferta;
- limites de conteúdo.

## Prioridade 3 — qualidade editorial

- permitir escolher estruturas narrativas prontas;
- sugerir redução quando o texto ficar excessivamente denso;
- validar repetição de argumentos entre slides;
- melhorar a legenda com objetivo, destino e CTA selecionados;
- oferecer prévia de sequência antes de substituir uma edição manual.

## Prioridade 4 — histórico

- autosave em nuvem;
- indicador de última sincronização;
- duplicar carrossel;
- renomear;
- restaurar versão;
- excluir sem remover assets compartilhados.

## Prompt de retomada

```text
Continue a Fábrica de Carrosséis a partir de
docs/fabrica/carrosseis/README.md.
Trabalhe sobre o HEAD mais recente dos remotos origin e lovable.
Não altere o motor do Anúncio F1. Preserve mudanças de outros agentes.
Comece pela persistência em nuvem separada por owner_id, project_id e package_id.
```
