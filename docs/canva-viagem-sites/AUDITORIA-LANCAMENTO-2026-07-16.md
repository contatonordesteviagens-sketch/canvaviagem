# Auditoria de lançamento — sites da Fábrica

**Data:** 16 de julho de 2026
**Escopo:** F2/site, modelos, projetos, publicação, pacotes, formulário, CRM, rotas Cloudflare e preparação do carrossel no F1.

## Resultado

Os seis modelos usam a mesma fonte de dados e o mesmo pipeline de publicação. O formulário principal continua no site e registra o lead no formulário canônico do projeto; o CTA do detalhe do pacote seleciona o destino e leva o viajante ao formulário existente. O pop-up dinâmico e os deep links funcionam nas versões PT e ES. Nenhum domínio adicional é criado por pacote ou rota.

O código está preparado para funcionar com ou sem a nova RPC atômica durante a implantação. A migration `20260716120000_publish_fabrica_site_atomic.sql` deve ser aplicada no projeto Supabase oficial antes de considerar encerrada a troca atômica de subdomínio.

## Falhas encontradas e corrigidas

### Formulário e CRM

- Leads antigos eram inseridos apenas em `analytics_events` e podiam ficar invisíveis ao dono por ausência de `user_id`.
- A mesma conversão era contada como formulário e analytics, duplicando o total.
- Eventos de telemetria que carregam `submission_id` agora são reconhecidos como espelho do envio canônico e não reaparecem como lead histórico.
- O CRM consultava o usuário inteiro e podia misturar projetos da mesma conta.
- O site agora publica/atualiza um `crm_forms` canônico por projeto, envia pelo endpoint público `submit-crm-form` e mantém fallback de continuidade.
- O total oficial de leads usa exclusivamente `crm_form_submissions`, filtrado por projeto. Registros antigos ou de contingência continuam visíveis como “histórico não verificado”, fora do total e com aviso de que podem não pertencer ao projeto.
- A alteração de fase do lead é persistida em `crm_form_submissions` nas versões PT e ES.
- A captura pública exige nome e um contato presentes no payload, limita o tamanho, mantém honeypot e recebe rate limit atômico por formulário/origem depois da migration.

### Projetos e persistência

- IDs temporários passam a resolver de forma determinística para UUID.
- A migração de cache local copia e verifica antes de apagar a origem, preservando o destino mais recente.
- Mídia local pesada é mesclada somente dentro do mesmo projeto.
- Pacotes recebem slug estável; renomear o título não quebra o deep link e duplicar gera outro slug.
- O editor usa `packageId`, `data-depo-index` e `data-faq-index`; itens ocultos ou em rascunho não deslocam mais a edição para o registro errado.
- A troca de projeto deixou de usar o aviso nativo com endereço técnico da Lovable. O diálogo do Canva Viagem explica o salvamento automático e aguarda a fila de nuvem; se falhar, a troca é cancelada.
- Ao trocar dentro do editor de sites, a tela Site é preservada mesmo que o snapshot tenha sido salvo em outra fase.
- A exclusão ganha uma RPC transacional que remove site, formulário, submissões e projeto juntos; o frontend mantém fallback compatível até a migration chegar.
- A exclusão bloqueia o autosave antes da chamada remota, aguarda gravações em andamento, resolve IDs temporários para UUID e só descarta a tela após sucesso. Em falha, o projeto permanece aberto e volta a sincronizar.
- As rotas antigas `/painel-marketing` e Minha Conta agora abrem projetos pelo mesmo `switchProject` seguro e excluem projeto, site e CRM pelo mesmo fluxo do painel principal.
- Ao excluir por essas rotas, o cache, a galeria, as mídias pesadas e o ponteiro ativo são removidos em PT e ES; o projeto apagado não pode mais ser reidratado e recriado pelo autosave.
- Métricas antigas sem `project_id` só são atribuídas quando a união de projetos salvos e sites publicados identifica no máximo uma agência; em contas com múltiplas identidades, elas ficam separadas e sinalizadas para evitar mistura.

### Publicação e armazenamento

- F2 e F5 usam um único pipeline.
- Imagens base64 são convertidas para WebP, limitadas a 1600 px, identificadas por SHA-256 e reutilizadas no Storage, inclusive imagens de pacotes em rascunho e do banco ainda não exibidas no HTML.
- URLs externas e do banco oficial continuam referenciadas, sem duplicar arquivo.
- A troca de subdomínio remove a publicação anterior do mesmo projeto; a migration adiciona unicidade e transação atômica.
- A FK de `public_sites.project_id` usa `ON DELETE CASCADE`, slugs legados só alcançam sites sem projeto e uma publicação concorrente não consegue tomar o slug de outro projeto da mesma conta.
- A migration foi corrigida para o tipo real `uuid`, valida propriedade do projeto e bloqueia subdomínios reservados.

### Editor e HTML público

- Fundos podem ser acionados diretamente na seção ou pelo botão “Editar fundo”.
- Botões de fundo e remoção ficam acessíveis em dispositivos sem hover.
- Imagens podem ser trocadas por toque, clique, Enter ou Espaço.
- Modais têm semântica de diálogo, foco inicial, ciclo de Tab, Escape e retorno do foco.
- Accordions fechados não deixam controles invisíveis na ordem do teclado.
- Foi eliminada a injeção duplicada de controles do editor após recarregar a prévia.
- O rodapé PT tinha uma tag de fechamento ausente; a hierarquia foi corrigida.
- O HTML ganhou `main`, skip link, rótulos de campos, título do mapa, contraste calculado e fallback de pacote sem texto corrompido.
- Foi removido o overflow horizontal observado na prévia de 375 px.
- O site ES recebeu o mesmo pop-up completo por pacote, CTA com pré-seleção do formulário, deep link, foco, Escape e retorno de foco do PT.
- O editor ES recebeu a mesma paleta primária/secundária/fundo, fundos por seção e campos opcionais avançados de pacote do editor PT.
- O e-mail automático de fallback agora remove acentos corretamente e não gera endereços truncados.
- Uma chamada condicional de hook em `ProtectedRoute` foi corrigida para evitar falha ao navegar entre blog e área autenticada.

## Matriz verificada

| Verificação | Resultado |
|---|---|
| Build Vite de produção | aprovado |
| TypeScript `--noEmit` | aprovado |
| Cloudflare Worker | 14 de 14 testes aprovados |
| Modelos PT | Padrão, Horizonte, Ofertas, Experiências, Expedições e Excursões renderizados |
| Formulários por modelo | 2, sem IDs duplicados |
| Endpoint público `submit-crm-form` | HTTP 200 no preflight do projeto oficial |
| Endpoint público `get-crm-form` | HTTP 200 no preflight do projeto oficial |
| Persistência do modelo | seleção mantida depois de recarregar e reabrir F2 |
| Pop-up do pacote | abre dinamicamente; CTA fecha, pré-seleciona o destino e mantém o formulário principal |
| Editor de fundo | modal aberto, foco correto e fechamento por Escape |
| Prévia mobile | 375 px sem rolagem horizontal após correção |
| Console do navegador | zero erros; somente avisos futuros já conhecidos do React Router |
| Lint | configuração restaurada; zero erros bloqueantes, dívida antiga mantida como avisos |

## Estado do Supabase

A CLI local estava autenticada em outro projeto e a proteção do repositório impediu o deploy incorreto. Nada foi alterado nessa conta. Os endpoints de CRM já estão ativos no projeto oficial.

Pendente com autenticação correta do projeto oficial:

1. colocar primeiro o frontend novo em produção;
2. executar o preflight abaixo e resolver conscientemente qualquer duplicata, sem exclusão automática;
3. aplicar as migrations, incluindo a política de assets e `20260716120000_publish_fabrica_site_atomic.sql`;
4. confirmar que o cache do PostgREST enxerga as RPCs;
5. somente depois republicar `submit-crm-form`, pois a função nova consulta `crm_forms.project_id`;
6. testar publicação, troca de subdomínio, formulário, rate limit e exclusão ponta a ponta com uma conta real.

```sql
SELECT owner_id, project_id, array_agg(id ORDER BY updated_at DESC)
FROM public.public_sites
WHERE project_id IS NOT NULL
GROUP BY owner_id, project_id
HAVING count(*) > 1;
```

Preflight somente leitura executado em 16/07/2026: existem 8 publicações vinculadas a projetos e 1 grupo duplicado. O projeto `ef3e4f90-3ace-4871-9edd-179fc24ab9a6` possui `levondordestinos` (mais recente) e `le-von-d-or-destinos` (anterior). Nenhum site foi apagado automaticamente. Antes da migration, confirmar com o responsável que o slug mais recente deve permanecer e despublicar o antigo de forma consciente.

Enquanto isso, o frontend usa o caminho compatível de upsert + limpeza do site anterior. Ele mantém a publicação funcional, mas não oferece a mesma garantia transacional da RPC.

## Limites conhecidos

- Sites já gravados em `public_sites` são snapshots: precisam ser republicados para receber o HTML novo.
- Métricas antigas sem `project_id` só são somadas automaticamente quando existe um único projeto identificável; em contas com vários projetos elas são preservadas como histórico da conta, mas não misturadas no projeto atual. A interface orienta a republicação.
- O Worker Cloudflare endurecido está pronto e testado no repositório, mas ainda precisa de autenticação Wrangler válida e confirmação do secret de produção antes do deploy. O frontend não depende desse deploy para abrir a Fábrica, porém os headers e o `404` correto de assets só entram após essa publicação separada.
- Campos personalizados do CRM que não aparecem no formulário fixo do site não podem ser tratados como obrigatórios nessa variante; o cadastro continua aceito por compatibilidade e deve evoluir para renderização dinâmica em uma etapa isolada.
- Avisos antigos de dependências de hooks, imports sem uso e tamanho de bundle não foram corrigidos em massa nesta entrega para evitar mudanças amplas fora do escopo.
- Não executar a fase de carrossel antes da migration/RLS própria e dos vínculos estáveis `projectId` + `packageId` descritos no plano.

## Próxima etapa recomendada

Iniciar o carrossel em feature flag PT-BR com duas famílias (`Oferta Direta` e `Experiência Editorial`), 3 a 7 slides, formato 4:5 padrão e uso exclusivo dos fatos do pacote. O site, formulário, CRM, Worker e publicação ficam fora do escopo dessa implementação.
