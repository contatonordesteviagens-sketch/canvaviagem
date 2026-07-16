# Arquitetura de publicação: Cloudflare e Supabase

## 1. Arquitetura real confirmada

Existem dois fluxos independentes. Não misturar a aplicação da Fábrica com a entrega pública dos sites das agências.

### Configuração e publicação

```text
Usuário na Fábrica/app
        ↓
estado editável + geração do HTML
        ↓
Supabase
├── dados da Fábrica
├── public_sites: HTML publicado por slug de agência
└── Storage: arquivos enviados pelo usuário
```

### Visita ao site de uma agência

```text
agencia.canvaviagem.com/qualquer-caminho
        ↓
Cloudflare DNS/proxy
        ↓
Worker Route *.canvaviagem.com/*
        ↓
Worker existente consulta Supabase public_sites pelo hostname
        ↓
HTML publicado da agência é devolvido diretamente
```

O Worker ativo não encaminha primeiro para Lovable, para o apex nem para o `SiteViewer`. A entrega normal de `slug.canvaviagem.com` depende do Cloudflare Worker, da linha correspondente em `public_sites` e dos arquivos referenciados pelo HTML.

## 2. Papel de cada serviço

### Cloudflare

- DNS, proxy, TLS e roteamento dos subdomínios públicos;
- uma Worker Route wildcard para todos os sites de agência;
- execução do Worker que resolve o slug e entrega o HTML.

### Supabase

- estado e entidades usadas pela Fábrica;
- HTML publicado em `public_sites`;
- Storage para arquivos realmente enviados pelo usuário;
- fonte consultada pelo Worker para entregar cada site.

### Lovable/origem do app

A infraestrutura da Lovable foi identificada na aplicação principal/Fábrica no apex. Ela não participa da entrega normal dos sites das agências e não existe um subdomínio Lovable por agência.

### `SiteViewer`

O `SiteViewer` permanece útil como visualização/fallback dentro da aplicação, por exemplo em fluxos de prévia ou rotas internas. Ele não é o caminho normal de produção de `agencia.canvaviagem.com`.

### Vercel

Vercel é infraestrutura histórica e não faz parte da arquitetura atual aprovada. Arquivos ou textos residuais não autorizam reativá-la.

## 3. O que a auditoria confirmou

Na auditoria autenticada de 16 de julho de 2026 foi confirmado que:

- existe uma Worker Route ativa `*.canvaviagem.com/*`;
- a rota aponta para um Worker existente em produção;
- o Worker consulta `public_sites` diretamente pelo slug extraído do hostname;
- um site publicado conhecido responde `200` na raiz;
- o mesmo site responde `200` em `/pacote/<slug>`;
- um subdomínio sem site publicado responde `404`;
- hosts reservados podem ter regras diferentes do wildcard.

Conclusão: a rota wildcard já atende caminhos arbitrários no mesmo subdomínio. Não é necessário criar outra rota, outro Worker, outro domínio ou outra linha de site apenas para adicionar detalhes de pacote.

## 4. Caminhos não criam domínios nem publicações extras

Todos estes endereços pertencem ao mesmo site da agência:

```text
agencia.canvaviagem.com/
agencia.canvaviagem.com/pacote/porto-de-galinhas
agencia.canvaviagem.com/pacote/gramado
agencia.canvaviagem.com/contato
```

Um caminho `/pacote/<slug>`:

- não cria registro DNS;
- não cria certificado;
- não consome outra Worker Route;
- não cria outro Worker;
- não cria outro domínio ou subdomínio;
- não exige uma nova linha em `public_sites`;
- não precisa duplicar o HTML ou as imagens do pacote.

Na arquitetura atual, o Worker devolve o mesmo HTML da agência para o caminho. O JavaScript já contido nesse HTML lê o slug do pacote e abre o detalhe correspondente. O custo incremental é o acesso normal à URL e o processamento no navegador, não uma nova hospedagem.

## 5. Fluxo de pacote e deep link

```text
GET agencia.canvaviagem.com/pacote/slug-do-pacote
        ↓
Worker identifica "agencia" pelo hostname
        ↓
consulta a mesma linha de public_sites
        ↓
devolve o HTML único da agência
        ↓
HTML identifica /pacote/slug-do-pacote
        ↓
abre o pop-up dinâmico desse pacote
```

Ao abrir um card dentro do site, o HTML pode usar `history.pushState` para refletir `/pacote/<slug>` sem recarregar. Ao acessar esse endereço diretamente, o Worker entrega o mesmo documento e o próprio site abre o pacote depois de carregar seus dados.

O slug do pacote deve ser estável. Alterar o título não deve quebrar links já compartilhados.

## 6. Estratégia correta de 404

Há três situações diferentes.

### Subdomínio sem site publicado

O Worker não encontra a linha correspondente em `public_sites` e responde `404`. Verificar:

1. se o DNS wildcard está proxied;
2. se a Worker Route `*.canvaviagem.com/*` continua ativa;
3. se o slug do hostname é válido e não reservado;
4. se o site foi publicado em `public_sites` com o identificador esperado;
5. se as políticas e credenciais do Worker permitem a leitura necessária.

Não investigar a Lovable como primeira hipótese: ela não está nesse caminho de entrega.

### Pacote inexistente em um site válido

O site da agência existe e o Worker pode responder `200` com seu HTML. O próprio site deve mostrar um estado lógico de “Pacote não encontrado”, oferecer retorno à lista e manter o restante da página utilizável. Isso não exige criar uma página 404 separada no Cloudflare.

### Arquivo inexistente

Imagem, CSS, JavaScript ou outro asset inexistente deve continuar retornando erro real da origem do arquivo. Não aplicar fallback de HTML a assets ou APIs.

## 7. Requisitos do Worker de produção

O Worker deve:

- aceitar somente hostnames subordinados à zona esperada;
- validar e normalizar o slug da agência;
- tratar hosts reservados antes do fluxo de sites públicos;
- usar o hostname, e não o caminho, para escolher a linha em `public_sites`;
- devolver o HTML da agência em navegações válidas;
- tratar `GET` e `HEAD` corretamente e rejeitar métodos não necessários;
- diferenciar site inexistente de falha temporária do Supabase;
- manter URL e query string disponíveis ao HTML, sem criar novas publicações;
- guardar credenciais somente em secrets/variáveis do Cloudflare;
- nunca registrar tokens, HTML completo, dados pessoais ou corpo do formulário;
- preservar o isolamento entre agências.

Antes de substituir o Worker ativo:

1. registrar a versão atualmente publicada para rollback;
2. configurar os secrets fora do repositório;
3. testar uma prévia isolada em `workers.dev`;
4. validar raiz, deep link, site inexistente, hosts reservados e falha do Supabase;
5. só então alterar produção e fazer testes de fumaça.

O Worker endurecido mantido no repositório é um candidato de substituição, não prova de que esteja ativo. A existência de código local nunca deve ser confundida com estado de produção.

## 8. Capacidade e custos relevantes

O número de pacotes ou caminhos não equivale ao número de domínios. Com uma única rota wildcard, os limites que realmente merecem monitoramento são:

- requisições e tempo de CPU do Worker;
- leituras e capacidade do Supabase;
- tamanho do HTML publicado por agência;
- armazenamento e transferência de imagens;
- repetição desnecessária de arquivos ou publicações.

Os limites numéricos variam por plano e podem mudar. Conferir a documentação oficial e o painel da conta antes de uma decisão financeira. Criar uma rota, domínio ou arquivo HTML por pacote seria mais complexo e não traz benefício para o pop-up dinâmico.

## 9. Referências oficiais

- [Cloudflare Workers — Routes](https://developers.cloudflare.com/workers/configuration/routing/routes/)
- [Cloudflare Workers — Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare Workers — Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Pages — Limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Cloudflare Pages — Known issues](https://developers.cloudflare.com/pages/platform/known-issues/)
- [Cloudflare R2 — Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare DNS — Features and availability](https://developers.cloudflare.com/dns/reference/all-features/)

## 10. Decisão registrada

Para os sites das agências do Canva Viagem:

- manter a Worker Route wildcard existente;
- manter o Supabase `public_sites` como fonte do HTML publicado;
- entregar o HTML diretamente pelo Worker, sem Lovable no caminho normal;
- usar `/pacote/<slug>` dentro do mesmo subdomínio;
- usar um único HTML e um único componente dinâmico por site, sem publicação por pacote;
- manter o `SiteViewer` como prévia/fallback da aplicação;
- não reativar Vercel;
- não substituir o Worker ativo sem prévia, testes e rollback documentado.
