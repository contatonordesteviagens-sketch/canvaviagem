## Diagnóstico confirmado

- Os leads existem no banco: há 8 leads reais para a conta atual e 9 no total entre agências.
- As permissões básicas de leitura para usuários autenticados existem agora.
- O erro atual na tela não é ausência de dados: as requests do CRM ainda estão recebendo `JWT expired` em `analytics_events` antes/ao carregar a carteira, e o componente transforma essa falha global em aviso vermelho com métricas zeradas.
- O botão “Tentar novamente” chama o refetch, mas se a sessão do preview/app continuar com token vencido, o erro se repete.

## Plano de correção

1. **Blindar o carregamento dos leads contra falhas de métricas**
   - Separar a busca da `Carteira de Clientes` da busca de métricas/analytics.
   - Se métricas falharem, ainda carregar e exibir os leads reais de `crm_form_submissions`.
   - Não exibir “Nenhum lead” quando o problema for sessão/rede/permissão.

2. **Tratar sessão expirada antes de qualquer consulta protegida**
   - Criar uma rotina local no CRM para obter uma sessão válida.
   - Se o token estiver expirado, tentar refresh.
   - Se o refresh falhar, mostrar mensagem clara de sessão expirada com orientação de login, sem zerar leads já carregados.

3. **Remover a dependência de `analytics_events` para mostrar a carteira**
   - A lista principal deve vir primeiro de `crm_form_submissions` por `owner_id = user.id`.
   - Eventos legados em `analytics_events` serão apenas complemento opcional; se falharem, não impedem os leads reais.

4. **Deduplicar leads exibidos**
   - Como há backfill + eventos legados, evitar duplicação visual quando o mesmo lead existe nas duas fontes.
   - Priorizar sempre o registro canônico de `crm_form_submissions`.

5. **Melhorar o botão “Tentar novamente”**
   - Fazer o botão realmente disparar uma nova tentativa completa de sessão + carteira.
   - Manter estado anterior na tela até a nova tentativa terminar.

6. **Validação final**
   - Conferir no banco que os leads continuam preservados.
   - Abrir `/fabrica/crm` autenticado no preview.
   - Confirmar visualmente que a carteira aparece com leads mesmo se métricas/analytics falharem.
   - Confirmar que não há botão ou lógica de exclusão de lead.

## Arquivos previstos

- `src/pages/fabrica/Phase5Dashboard.tsx`

## Garantias

- Não vou apagar, truncar, dropar ou migrar dados de leads.
- Não vou remover o filtro por dono da conta (`owner_id = user.id`).
- Não vou adicionar botão de excluir lead.
- Não vou mexer na estrutura do banco a menos que uma validação mostre nova falta real de permissão.