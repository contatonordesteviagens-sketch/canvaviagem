
## O que está acontecendo (explicação simples)

- A “pasta de gestão” que você usava é uma **página interna** do app chamada **Gestão**, acessível pela URL: **/gestao**.
- Ela é “secreta” no sentido de que **não aparece no menu para usuários comuns** e tem **proteção**:
  1) Você precisa estar **logado**  
  2) Seu usuário precisa ter permissão de **administrador** no backend  
- Quando você tenta entrar e cai na Home, isso acontece porque o app está entendendo (mesmo que por poucos instantes) que você **não é admin** — e te redireciona.

## Onde está a página de Gestão hoje

- **Página principal de gestão**: `/gestao` (painel com abas: Dashboard, Conteúdo, Importar, Notas, Preview, Histórico, Usuários)
- **Login administrativo (email + senha)**: `/admin-login`

Hoje, o app **não tem um botão visível** no menu para te levar até `/gestao`, e isso torna “difícil de achar”.

## Por que você está sendo redirecionado para a página inicial

No arquivo `src/pages/Gestao.tsx`, a regra atual é:

- Se não estiver logado → vai para `/admin-login`
- Se estiver logado mas **isAdmin** vier como `false` → vai para `/` (Home)

O problema: o `isAdmin` é carregado de forma assíncrona (leva alguns instantes para confirmar no backend). Nesse intervalo, ele começa como `false`, e a página **redireciona cedo demais**.

Isso explica exatamente o seu sintoma: “eu clico e volto para a home”.

## Como essa “página secreta” foi criada e protegida (bem direto)

### 1) Ela foi criada como rota do app
Em `src/App.tsx` existe:
- `<Route path="/gestao" element={<Gestao />} />`

### 2) A proteção funciona em 2 camadas
1) **Na interface (frontend)**: a página `/gestao` faz checagens e redireciona se não for admin.  
2) **No backend (o mais importante)**: as tabelas usadas pela gestão (conteúdos, legendas, ferramentas, etc.) têm regras de segurança por função (admin) e não deixam um usuário comum “editar” mesmo que ele tente forçar a interface.

## O que vou implementar para resolver e deixar fácil de acessar

### A) Corrigir o acesso à `/gestao` (parar o redirecionamento “cedo demais”)
Objetivo: quando você abrir `/gestao`, ela deve:
- Mostrar um carregamento curto (“Verificando permissões…”)
- Só depois decidir:
  - Admin → entra
  - Não-admin → não entra

Implementação (opção mais segura e simples):
- Em `src/pages/Gestao.tsx`, trocar a checagem `isAdmin` do `AuthContext` por uma checagem que já tem estado de carregamento (`useIsAdmin()`), igual o `AdminLayout` faz.
- Enquanto estiver carregando, mostrar spinner (ao invés de redirecionar).

Resultado esperado:
- Você não será mais jogado para a Home enquanto o status de admin está sendo verificado.

### B) Criar um acesso “simples e fácil” no menu (só aparece para admin)
Objetivo: você não precisar lembrar URL.

Implementação:
- Em `src/components/Header.tsx`, adicionar um item “Gestão” apontando para `/gestao`:
  - Desktop: na barra do topo
  - Mobile: dentro do menu lateral
- Esse item só aparece quando o usuário for admin.

Resultado esperado:
- Logou como admin → aparece “Gestão” no menu → 1 clique.

### C) Adicionar atalho na tela de login comum para admins
Objetivo: se você estiver na tela `/auth` (login normal por link no email), você enxergar um link “Acesso administrativo”.

Implementação:
- Em `src/pages/Auth.tsx`, incluir um link discreto tipo:
  - “Acesso administrativo” → leva para `/admin-login`

Resultado esperado:
- Você encontra o login admin sem precisar “caçar”.

### (Opcional) D) Criar um caminho único “/dashboard” que sempre te leva ao lugar certo
Se você quiser algo ainda mais simples:
- Criar rota `/dashboard` que:
  - Se admin → manda para `/gestao`
  - Se não logado → manda para `/admin-login`
  - Se logado sem permissão → manda para `/` (ou mostra aviso)

Eu posso incluir isso para virar seu “atalho oficial”.

## Checklist de testes (eu vou validar após implementar)

1) Deslogado → abrir `/gestao` → redireciona para `/admin-login`
2) Logado como admin → abrir `/gestao` → entra (sem cair na Home)
3) Logado como não-admin → abrir `/gestao` → bloqueia corretamente
4) Menu (desktop e mobile):
   - Admin vê “Gestão”
   - Usuário comum não vê
5) Login comum (`/auth`) mostra link “Acesso administrativo” → `/admin-login`

## Observação importante (para você conseguir usar já)
Mesmo antes das melhorias de menu, o caminho correto é:
- entrar em **/admin-login** → fazer login → ir para **/gestao**  
O que está quebrando hoje é só o “timing” do carregamento do admin; vou corrigir isso na etapa A.

## Arquivos que serão alterados

- `src/pages/Gestao.tsx` (corrigir timing do gate de admin)
- `src/components/Header.tsx` (adicionar link “Gestão” para admin no topo e no menu mobile)
- `src/pages/Auth.tsx` (adicionar link “Acesso administrativo”)
- (Opcional) `src/App.tsx` (adicionar rota `/dashboard`)
