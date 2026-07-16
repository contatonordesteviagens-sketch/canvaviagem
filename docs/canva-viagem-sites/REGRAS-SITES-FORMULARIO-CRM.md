# Regras dos sites, formulário e CRM

## 1. Contratos que não podem ser quebrados

### Uma fonte de verdade

As informações inseridas pelo usuário na Fábrica devem alimentar os templates automaticamente:

- nome e logo da agência;
- e-mail, telefone, WhatsApp e endereço;
- identidade visual;
- pacotes selecionados e seus detalhes;
- imagens e textos editados;
- configurações de seções;
- rodapé e dados legais editáveis;
- configurações de rastreamento aprovadas.

O template escolhe a apresentação, não cria um cadastro paralelo.

### Formulário e CRM protegidos

O formulário principal do site é uma integração operacional, não apenas um elemento visual. Ao trabalhar no site:

- não renomear campos usados pela integração sem migração planejada;
- não remover identificadores, handlers ou contexto de agência;
- não criar um segundo envio de lead dentro do pop-up de pacote;
- não trocar endpoint, tabela ou função de integração para “simplificar” a interface;
- não alterar validação, consentimento ou rastreamento sem teste completo;
- não permitir que um lead de uma agência seja gravado na conta de outra.

O novo fluxo deve apenas preencher ou selecionar o interesse no formulário existente.

## 2. Fluxo aprovado para pacotes

```text
Site da agência
      ↓
Card resumido do pacote
      ↓
Pop-up dinâmico completo
      ↓
CTA “Reservar este pacote”
      ↓
Formulário principal com pacote selecionado
      ↓
CRM da agência
```

O pop-up não possui um formulário reduzido próprio. Ele explica a oferta, aumenta a confiança e entrega o visitante ao formulário já integrado.

## 3. Compatibilidade com o que já existe

Todos os campos detalhados de pacote são opcionais. Um pacote antigo contendo apenas título, descrição, preço e imagem deve continuar:

- aparecendo no card;
- abrindo o pop-up com o conteúdo disponível;
- selecionando o interesse correto no formulário;
- chegando ao CRM como chegava antes.

Regras de renderização:

- não mostrar títulos de seção vazia;
- não renderizar listas sem itens;
- aplicar valores padrão somente quando forem verdadeiros e seguros;
- nunca inventar datas, inclusões, preços, condições ou políticas;
- preservar IDs estáveis dos pacotes;
- gerar um slug estável separado do título editável.

## 4. Editabilidade dos templates

“100% editável” significa que toda informação pertencente à agência ou à oferta tem um caminho de edição claro. Isso inclui:

- textos de topo e seções;
- fundos e cores;
- imagens;
- nome e logo;
- navegação e CTAs;
- depoimentos e perguntas frequentes;
- contatos, endereço e mapa;
- detalhes dos pacotes;
- rodapé, ano e aviso de direitos.

A assinatura “Feito no Canva Viagem”, quando exigida pelo produto, é uma exceção de plataforma e não deve ser apresentada como nome da agência.

Uma edição visual direta e a edição por painel devem atualizar o mesmo estado. Ao recarregar a Fábrica ou republicar, o modelo e as alterações salvas não podem voltar ao padrão.

## 5. Regras para novos templates

Um template novo deve consumir o mesmo contrato de dados do template padrão. Para aprová-lo, verificar:

1. identidade e contatos sincronizados;
2. seleção do modelo persistida;
3. todos os pacotes existentes renderizados;
4. pop-up dinâmico recebendo o pacote correto;
5. CTA selecionando o interesse no formulário principal;
6. submissão entrando no CRM da conta certa;
7. edição e salvamento de textos, imagens e cores;
8. publicação e atualização do mesmo slug;
9. visual em telas pequenas, médias e grandes;
10. compatibilidade com conteúdo antigo incompleto.

Não copiar regras de negócio para dentro de cada template. Reutilizar componentes, serialização e helpers do motor de site.

## 6. Mobile-first e acessibilidade

Projetar primeiro para uma largura estreita. No celular:

- cards devem ter alvos de toque de pelo menos 44 × 44 px;
- textos não devem se sobrepor nem depender de hover;
- o pop-up deve ocupar a tela de forma confortável e rolar internamente;
- o CTA principal deve permanecer fácil de alcançar;
- o teclado virtual não pode esconder campos críticos;
- imagens devem reservar espaço para evitar saltos de layout;
- contraste deve permanecer legível com as cores escolhidas pelo usuário.

O pop-up deve ter:

- título acessível;
- foco inicial controlado;
- fechamento por botão e tecla Esc;
- foco preso enquanto estiver aberto;
- retorno do foco ao card que o abriu;
- bloqueio do scroll da página de fundo;
- respeito a `prefers-reduced-motion`.

## 7. Conteúdo, segurança e privacidade

- Escapar ou sanitizar conteúdo editável antes de inseri-lo no HTML.
- Não inserir HTML arbitrário fornecido pelo usuário sem sanitização.
- Não expor IDs internos sensíveis em textos públicos.
- Não registrar conteúdo do formulário em logs de Worker.
- Não colocar chaves do Supabase com privilégio de serviço no frontend.
- Manter políticas RLS e a associação entre usuário, site e agência.
- Validar URLs antes de usá-las como imagem ou link.

## 8. Critérios de aceite do fluxo completo

O trabalho só está pronto quando, em um site publicado de teste:

1. o card abre o pacote correto;
2. campos vazios não geram lacunas ou rótulos órfãos;
3. o botão de reserva fecha o pop-up e leva ao formulário principal;
4. o pacote já aparece selecionado;
5. o envio cria um lead apenas no CRM da agência dona do site;
6. voltar, atualizar e reabrir preserva o modelo e o conteúdo salvo;
7. a mesma publicação funciona em mobile e desktop;
8. um pacote antigo continua funcionando sem migração obrigatória.
