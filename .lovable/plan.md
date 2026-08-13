# Diagnóstico: HTTP 500 em fabrica-entitlements (13/08 20:02 UTC)

## O que foi verificado (somente leitura)

1. **Logs da função** — a consulta de logs de `fabrica-entitlements` retornou **vazia** (nenhum evento, nem boot/shutdown). Ou seja: não há stack/mensagem registrada para 20:02 UTC. Isso é relevante por si só: significa que **não existe execução recente registrada dessa função** no runtime — comportamento compatível com uma função que não está respondendo/instanciando, ou com logs não retidos para esse intervalo.

2. **Conta `debc503c-...0f64`**
   - `user_roles`: possui `admin`.
   - `subscriptions`: 1 linha (`active`, `prod_UTSmPe3GPt8iHt` = Elite), sem duplicidade — não há erro de `maybeSingle`.
   - `fabrica_usage_ledger`: 0 linhas para esse usuário.

3. **Coluna `fingerprint` — confirmado o problema.** A tabela `public.fabrica_usage_ledger` tem hoje: `id, user_id, capability, idempotency_key, project_id, status, metadata, expires_at, created_at, updated_at, server_fingerprint`. **Não existe a coluna `fingerprint`.**
   Existem duas versões da função:
   - `reserve_fabrica_usage(uuid,text,text,text,jsonb,integer)` — antiga, não usa `fingerprint`.
   - `reserve_fabrica_usage(uuid,text,text,text,jsonb,integer,text,text)` — a que a Edge Function chama; ela **lê e grava a coluna `fingerprint`** (no `UPDATE ... fingerprint = p_fingerprint`, no `SELECT count(*)` e no `INSERT`).
   Conclusão: qualquer chamada de `reserve` que chegue ao RPC falha com erro Postgres `42703 column "fingerprint" does not exist`, que a função converte em HTTP 500 `{"error":"Serviço temporariamente indisponível"}`.

4. **Ressalva importante sobre esta conta específica:** no código-fonte atual, um usuário admin recebe `unlimited = true` e o `reserve` retorna antes de chamar o RPC. Portanto, se a versão publicada fosse idêntica ao código do repositório, esse admin não deveria atingir o erro de `fingerprint`. Isso aponta para uma das duas hipóteses (ainda **não confirmada**, pois não há logs): a versão publicada é mais antiga que a do repositório, ou o 500 vem de outra origem (ex.: falha de env/guard `assertOfficialSupabaseProject`, que também lança 500 genérico). O 500 em `action=status` reforça essa segunda hipótese, já que `status` nunca toca o RPC.

5. **Commit publicado a37a8a17:** não é possível confirmar. Não há endpoint que exponha o commit/bundle da função implantada. O que dá para afirmar: no workspace, o último commit que tocou `fabrica-entitlements` / `_shared` é `dd2cb61f`, ou seja **posterior** a `a37a8a17` — se a função publicada for de `a37a8a17`, ela está desatualizada em relação ao código atual.

## Correções recomendadas (nada aplicado)

1. **Migration** para alinhar o schema com a função: adicionar `fingerprint text` em `public.fabrica_usage_ledger` (+ índice em `(capability, fingerprint)`), ou, alternativamente, reescrever `reserve_fabrica_usage` de 8 args para usar apenas `server_fingerprint`. Recomendo adicionar a coluna, pois a função já foi escrita com anti-abuso por dispositivo.
2. **Remover a sobrecarga antiga** de 6 argumentos para evitar ambiguidade futura.
3. **Republicar `fabrica-entitlements`** a partir do commit atual e, imediatamente após, disparar uma chamada de teste para gerar logs — assim confirmamos se o 500 de `action=status` some (o que provaria versão defasada) ou persiste (o que apontaria para env/guard).

Nada foi alterado, publicado ou commitado neste diagnóstico.
